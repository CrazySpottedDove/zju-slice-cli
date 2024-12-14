import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import inquirer from 'inquirer';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let userConfig = {
    split: true
}
if (!fs.existsSync(path.join(__dirname, '.course_cache', 'userConfig.json'))) {
    fs.writeFileSync(path.join(__dirname, '.course_cache', 'userConfig.json'), JSON.stringify(userConfig, null, 4));
}
else {
    userConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '.course_cache', 'userConfig.json')))
}

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
    fs.writeFileSync(path.join(__dirname, '.course_cache', 'userConfig.json'), JSON.stringify(userConfig, null, 4));
    console.log(`用户设置已保存到 ${path.join(__dirname, '.course_cache', 'userConfig.json')}`);
})

