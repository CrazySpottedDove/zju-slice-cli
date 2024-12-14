import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userAccountDir =   path.join(__dirname, '.course_cache','userAccount.json');
const userAccount = JSON.parse(fs.readFileSync(userAccountDir, 'utf-8'));
const { username, password } = userAccount;
const cacheDir = path.join(__dirname, '.course_cache');
const cacheFile = path.join(cacheDir, 'courses.json');
(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const loginUrl = "https://zjuam.zju.edu.cn/cas/login?service=https%3A%2F%2Fidentity.zju.edu.cn%2Fauth%2Frealms%2Fzju%2Fbroker%2Fcas-client%2Fendpoint?state%3DEWAcKAP4o8PN5h3-2wqi2rldugynbh_l1kgAT_Z9QwQ.3OZB_d7BIU8.TronClass#/";

    console.log(chalk.blue('Logging in...'));
    await page.goto(loginUrl);

    // 模拟输入用户名和密码
    await page.type('#username', username);
    await page.type('#password', password);

    // 模拟点击登录按钮
    await page.click('#dl');

    // 等待导航完成
    await page.waitForNavigation();
    await page.waitForSelector('#userId');
    console.log(chalk.green('Login has succeeded!'));

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
        console.log(chalk.blue(`GotUrl: ${currentUrl}`));
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
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
    }
    fs.writeFileSync(cacheFile, JSON.stringify(allCourses, null, 2));

    await browser.close();
})();