import fs from 'fs';
import path from 'path';
import chalk from 'chalk'
import { cacheDir } from './share/reader.js';
import { login } from './share/login.js';

(async () => {
    const { page, browser } = await login();
    let allCourses = [];
    let pageIndex = 1;

    while (true) {
        const pageUrl = `https://courses.zju.edu.cn/user/courses#/?pageIndex=${pageIndex}`;

        // 清除缓存
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.goto('about:blank'); // 确保缓存清除生效
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.semester-list .course');
        // ！如果不清除缓存，将得到同一页面内容！

        // 获取当前页的课程信息
        const courses = await page.evaluate(() => {
            const courseElements = document.querySelectorAll('.semester-list .course');
            return Array.from(courseElements).map(courseElement => {
                const courseName = courseElement.querySelector('.course-name a').innerText;
                let courseLink = courseElement.querySelector('.course-name a').href;
                let semester = courseElement.querySelector('.truncate-text.ng-scope span').getAttribute('title');                // 替换链接中的 content 为 courseware
                courseLink = courseLink.replace('content', '');
                return { name: courseName, link: courseLink, semester: semester };
            });
        });

        // 检查是否获取到新的课程信息
        if (courses.length === 0) {
            console.error(chalk.red('No more courses found, exiting loop.'));
            break;
        }

        allCourses = allCourses.concat(courses);

        // 检查是否已经到达最后一页
        const currentUrl = page.url();
        console.log(chalk.blue(`HitUrl: ${currentUrl}`));
        if (currentUrl !== pageUrl) {
            break;
        }

        pageIndex++;

        // 添加一个最大页数限制，以防止意外情况导致的无限循环
        if (pageIndex > 100) {
            console.error(chalk.red('Reached maximum page limit'));
            break;
        }
    }

    console.log(chalk.green('Upgrade has completed successfully!'));
    // 保存课程信息到缓存文件

    fs.writeFileSync(path.join(cacheDir, 'courses.json'), JSON.stringify(allCourses, null, 2));

    await browser.close();
})();