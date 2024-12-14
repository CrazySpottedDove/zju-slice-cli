import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import path from 'path';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let location = path.join(__dirname, 'courses-fetched')
if (!fs.existsSync(path.join(__dirname, '.course_cache', 'location.json'))) {
    fs.writeFileSync(path.join(__dirname, '.course_cache', 'location.json'), JSON.stringify({ location: location }, null, 4));
}
else{
    location = JSON.parse(fs.readFileSync(path.join(__dirname, '.course_cache', 'location.json'))).location
}

if(!fs.existsSync(location)){
    execSync(`mkdir -p ${location}`)
}

console.log(chalk.gray(`默认保存路径：${path.join(__dirname, 'courses-fetched')}`))
console.log(`当前保存路径：${location}`)
let newLocation = ''
inquirer.prompt([
    {
        type: 'input',
        name: 'location',
        message: '请输入新的保存路径:'
    }
]).then(answer => {
    newLocation = answer.location
    fs.writeFileSync(path.join(__dirname, '.course_cache', 'location.json'), JSON.stringify(answer, null, 4));
    console.log(`保存路径已保存到 ${path.join(__dirname, '.course_cache', 'location.json')}`);
    if (newLocation) {
        console.log(`正在移动文件...`)
        if (!fs.existsSync(newLocation)) {
            fs.mkdirSync(newLocation, { recursive: true });
        }
        execSync(`mv ${location}/* ${newLocation}`)
        execSync(`rmdir ${location}`)
    }
})




