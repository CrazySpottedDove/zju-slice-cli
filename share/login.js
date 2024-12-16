import { readAllConfigs } from './reader.js';
import puppeteer from 'puppeteer';
import chalk from 'chalk';
const { username, password } = readAllConfigs();
async function login() {
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
    return { page: page, browser: browser };
}
export{
    login
}