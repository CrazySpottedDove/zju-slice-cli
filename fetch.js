import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';

import { readAllConfigs, cacheDir } from './share/reader.js';
import { login } from './share/login.js';
let { coursesDir, split, courseConfig, linkCache, titleCache } = readAllConfigs();


(async () => {
    const { page, browser } = await login();

    const pageUrl = `https://courses.zju.edu.cn/user/courses#/?pageIndex=1`;
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });

    // 获取当前页面的 Cookie
    const cookies = await page.cookies();
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    // 接受资源链接，完成下载任务
    const downloadFile = async (link, courseDir, cookieString) => {
        const maxDownloadRetries = 3;
        let downloadAttempt = 0;
        let fileName = path.basename(link);
        while (downloadAttempt < maxDownloadRetries) {
            try {
                const response = await fetch(link, {
                    headers: {
                        'Cookie': cookieString
                    }
                });
                const buffer = await response.arrayBuffer();

                // 检查 Content-Disposition 头以获取文件名
                const disposition = response.headers.get('content-disposition');
                if (disposition && disposition.includes('filename=')) {
                    const match = disposition.match(/filename="?(.+)"?/);
                    if (match && match.length > 1) {
                        fileName = match[1];
                    }
                }

                // 解码文件名并移除多余字符，确保文件名为 UTF-8 编码
                fileName = decodeURIComponent(escape(fileName.replace(/\+/g, ' '))).replace(/["']/g, '');

                const filePath = path.join(courseDir, fileName);
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, Buffer.from(buffer));
                    console.log(chalk.green(`-> ${fileName}`));
                }

                break; // 成功后退出重试循环
            } catch (downloadError) {
                downloadAttempt++;
                console.log(chalk.red(`Error downloading file: ${fileName}, attempt: ${downloadAttempt}, error: ${downloadError}`));
                if (downloadAttempt >= maxDownloadRetries) {
                    console.log(chalk.red(`-> ${fileName}, failed ${maxDownloadRetries} times`));
                } else {
                    console.log(chalk.yellow(`-> ${fileName}, try ${downloadAttempt} times`));
                    await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒后重试
                }
            }
        }
    };

    // 接受一门课程，下载它的课件和作业
    const downloadCourseMaterials = async (course, semesterDir) => {
        const coursePage = await browser.newPage();
        try {
            console.log(chalk.blue(`Courseware <${course.name}>`));

            await coursePage.goto(course.link + 'courseware', { waitUntil: 'networkidle2' });

            let hasNextPage = true;
            while (hasNextPage) {
                await coursePage.waitForSelector('.list-pager', { timeout: 5000 });
                console.log(chalk.blue(`Courseware page loaded.`));
                const downloadLinks = await coursePage.evaluate((linkCache) => {
                    const downloadElements = document.querySelectorAll('a[original-title="下载"]');
                    const links = Array.from(new Set(Array.from(downloadElements).map(el => el.href)));

                    return links;
                }, linkCache);
                let newDownloadLinks = [];
                downloadLinks.forEach(link => {
                    if (!linkCache.includes(link)) {
                        linkCache.push(link);
                        newDownloadLinks.push(link);
                    }
                })
                // 创建课程目录
                const courseDir = path.join(semesterDir, course.name);
                if (!fs.existsSync(courseDir)) {
                    fs.mkdirSync(courseDir);
                }

                let coursewareDir = courseDir;
                if (split) {
                    coursewareDir = path.join(courseDir, 'courseware');
                    if (!fs.existsSync(coursewareDir)) {
                        fs.mkdirSync(coursewareDir);
                    }
                }

                await Promise.all(newDownloadLinks.map(link => downloadFile(link, coursewareDir, cookieString)));

                hasNextPage = await coursePage.evaluate(() => {
                    const nextPageButton = document.querySelector('li.next-page-button a.pager-button[ng-click="changePage(pageIndex+1)"]');
                    if (nextPageButton && !nextPageButton.closest('li').classList.contains('ng-hide')) {
                        nextPageButton.click();
                        return true;
                    }
                    return false;
                });

                if (hasNextPage) {

                    console.log(chalk.blue('Navigating to next page...'));
                    // await coursePage.waitForTimeout(3000); // 等待页面加载
                } else {
                    console.log(chalk.blue('No more pages.'));
                }
            }


            await coursePage.close();
            console.log(chalk.green(`--> ${course.name} - 课件`));
        } catch (error) {
            console.log(chalk.red(`Error downloading course: ${course.name}, error: ${error}`));
            await coursePage.close();
        }
    };

    const downloadHomework = async (course, semesterDir) => {
        const coursePage = await browser.newPage();
        await coursePage.goto(course.link + 'homework', { waitUntil: 'networkidle2' });
        await coursePage.waitForSelector('div.filter.ng-scope', { timeout: 10000 });
        console.log(chalk.blue(`Homework <${course.name}>`));
        // 获取所有作业的title
        let homeworkTitles = await coursePage.evaluate(() => {
            const homeworkElements = document.querySelectorAll('span.shorten-title.ng-binding');
            return Array.from(homeworkElements).map(homeworkElement => {
                return homeworkElement.getAttribute('original-title');
            });
        });
        let newHomeworkTitles = [];
        homeworkTitles.forEach(title => {
            if (!titleCache.includes(course.link + title)) {
                titleCache.push(course.link + title);
                newHomeworkTitles.push(title);
            }
        })

        for (const homeworkTitle of newHomeworkTitles) {
            try {
                console.log(chalk.blue(`Homework <${course.name}> - ${homeworkTitle}`));
                const homeworkPage = await browser.newPage();
                await homeworkPage.goto(course.link + 'homework', { waitUntil: 'networkidle2' });
                await homeworkPage.waitForSelector('div.filter.ng-scope', { timeout: 10000 });
                // 点击作业链接
                await homeworkPage.evaluate((title) => {
                    const element = Array.from(document.querySelectorAll('span.shorten-title.ng-binding')).find(el => el.getAttribute('original-title') === title);
                    if (element) {
                        element.click();
                    }
                }, homeworkTitle);

                // 增加导航超时时间
                await homeworkPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

                // 确保页面加载完成
                await homeworkPage.waitForSelector('div.activity-attributes-section.section.homework-activity', { timeout: 10000 });
                console.log(chalk.blue(`Homework page ${homeworkTitle} loaded.`));
                // 获取下载链接
                const downloadLinks = await homeworkPage.evaluate(() => {
                    const downloadElements = document.querySelectorAll('a[original-title="下载"]');
                    const links = Array.from(new Set(Array.from(downloadElements).map(el => el.href)));
                    return links;
                });

                const courseDir = path.join(semesterDir, course.name);
                if (!fs.existsSync(courseDir)) {
                    fs.mkdirSync(courseDir);
                }

                let homeworkDir = courseDir;

                if (split) {
                    homeworkDir = path.join(courseDir, 'homework');
                    if (!fs.existsSync(homeworkDir)) {
                        fs.mkdirSync(homeworkDir);
                    }
                }
                let newDownloadLinks = [];

                downloadLinks.forEach(link => {
                    if (!linkCache.includes(link)) {
                        linkCache.push(link);
                        newDownloadLinks.push(link);
                    }
                })

                await Promise.all(newDownloadLinks.map(link => downloadFile(link, homeworkDir, cookieString)));

                // 关闭新页面
                await homeworkPage.close();
            } catch (error) {
                console.log(chalk.red(`Error downloading homework: ${homeworkTitle}, error: ${error}`));
            }
        }

        await coursePage.close();
        console.log(chalk.green(`--> ${course.name} - 作业`));
    };

    const downloadAllCourses = async () => {
        for (const semester of Object.keys(courseConfig)) {
            const semesterDir = path.join(coursesDir, semester);
            if (!fs.existsSync(semesterDir)) {
                fs.mkdirSync(semesterDir);
            }
            for (const course of courseConfig[semester]) {
                await downloadCourseMaterials(course, semesterDir);
                await downloadHomework(course, semesterDir);
            }
        }
    };

    await downloadAllCourses();

    await browser.close();
    fs.writeFileSync(path.join(cacheDir, 'linkCache.json'), JSON.stringify(linkCache, null, 4));
    fs.writeFileSync(path.join(cacheDir, 'titleCache.json'), JSON.stringify(titleCache, null, 4));
    console.log(chalk.green('All downloads completed, browser closed.'));
})();