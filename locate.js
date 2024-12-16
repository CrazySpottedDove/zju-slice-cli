import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { readAllConfigs, cacheDir, __dirname } from './share/reader.js';
const { coursesDir } = readAllConfigs();

console.log(chalk.gray(`默认保存路径：${path.join(__dirname, 'courses-fetched')}`))
console.log(`当前保存路径：${coursesDir}`)
let newCoursesDir = ''
inquirer.prompt([
    {
        type: 'list',
        name: 'location',
        message: '请选择操作:',
        choices: [
            { name: '修改保存路径', value: 'editCoursesDir' },
            { name: '退出', value: 'exit' }
        ]
    }
]).then(answer => {
    if (answer.location === 'exit') {
        process.exit(0)
    }

    inquirer.prompt([
        {
            type: 'input',
            name: 'location',
            message: '请输入新的保存路径:'
        }
    ]).then(answer => {
        newCoursesDir = answer.location
        fs.writeFileSync(path.join(cacheDir, 'location.json'), JSON.stringify(answer, null, 4));
        console.log(`保存路径已保存到 ${path.join(cacheDir, 'location.json')}`);
        if (newCoursesDir && newCoursesDir !== coursesDir) {
            console.log(`正在移动文件...`)
            if (!fs.existsSync(newCoursesDir)) {
                fs.mkdirSync(newCoursesDir, { recursive: true });
            }
            execSync(`mv ${coursesDir}/* ${newCoursesDir}`)
            execSync(`rmdir ${coursesDir}`)
            console.log(chalk.green(`文件已移动到 ${newCoursesDir}`))
        }
    })


})




