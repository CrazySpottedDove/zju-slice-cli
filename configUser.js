import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { readAllConfigs, cacheDir } from './share/reader.js';
const {userConfig} = readAllConfigs()

function split(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'split',
            message: `保存时是否区分课件与作业？`,
            choices: [
                { name: '是', value: true },
                { name: '否', value: false }
            ]
        }
    ]).then(answer => {
        userConfig.split = answer.split
        fs.writeFileSync(path.join(cacheDir, 'userConfig.json'), JSON.stringify(userConfig, null, 4));
        console.log(`用户设置已保存到 ${path.join(cacheDir, 'userConfig.json')}`);
    })


}
function background(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'background',
            message: `fetch 是否后台运行？`,
            choices: [
                { name: '是', value: true },
                { name: '否', value: false }
            ]
        }
    ]).then(answer => {
        userConfig.background = answer.background
        fs.writeFileSync(path.join(cacheDir, 'userConfig.json'), JSON.stringify(userConfig, null, 4));
        console.log(`用户设置已保存到 ${path.join(cacheDir, 'userConfig.json')}`);
    })
}

inquirer.prompt([
    {
        type: 'list',
        name: 'method',
        message: '请选择操作:',
        choices: [
            { name: '修改是否区分课件/作业', value: 'split' },
            { name: '修改 fetch 是否后台运行', value: 'background' },
            { name: '退出', value: 'exit' }
        ]
    }
]).then(answer => {
    if (answer.method === 'exit') {
        process.exit(0)
    }
    switch (answer.method) {
        case 'split':
            split()
            break
        case 'background':
            background()
            break
    }
})
