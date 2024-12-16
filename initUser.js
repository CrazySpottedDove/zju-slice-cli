import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { cacheDir } from './share/reader.js';

const userAccountFile = path.join(cacheDir, 'userAccount.json');

async function inituserAccount() {
    // 询问用户输入用户名和密码
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: '请输入用户名:'
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入密码:'
        }
    ]);

    // 将用户输入的用户名和密码存储在 userAccount.json 文件中
    fs.writeFileSync(userAccountFile, JSON.stringify(answers, null, 2));
    console.log(`用户配置已保存到 ${userAccountFile}`);
}

// 调用函数
inituserAccount();