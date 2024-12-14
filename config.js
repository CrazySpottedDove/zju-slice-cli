import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const __dirname = path.resolve();
const cacheDir = path.join(__dirname, '.course_cache');
console.log(__dirname)
const cacheFile = path.join(cacheDir, 'courses.json');
const configFile = path.join(cacheDir, 'courseConfig.json');

async function config() {
    if (!fs.existsSync(cacheFile)) {
        console.log('No cache found. Please run zcourse --upgrade first.');
        return;
    }

    const data = fs.readFileSync(cacheFile);
    const allCourses = JSON.parse(data);

    // 获取所有学期
    const semesters = [...new Set(allCourses.map(course => course.semester))];

    // 让用户选择学期（多选）
    const semesterAnswers = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedSemesters',
            message: '请选择一个或多个学期:',
            choices: semesters
        }
    ]);

    const selectedSemesters = semesterAnswers.selectedSemesters;
    console.log(`你选择了学期: ${selectedSemesters.join(', ')}`);

    const config = {};
    for (const semester of selectedSemesters) {
        // 获取该学期的所有课程
        const coursesInSemester = allCourses.filter(course => course.semester === semester);

        // 让用户选择需要的课程（多选）
        const courseAnswers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedCourses',
                message: `请选择 ${semester} 学期需要的课程:`,
                choices: coursesInSemester.map(course => course.name)
            }
        ]);

        const selectedCourseNames = courseAnswers.selectedCourses;
        console.log(`你选择了 ${semester} 学期的课程: ${selectedCourseNames.join(', ')}`);

        // 将用户的选择按学期分类，并写入 {name, link}
        config[semester] = selectedCourseNames.map(courseName => {
            const course = coursesInSemester.find(course => course.name === courseName);
            return { name: course.name, link: course.link };
        });
    }

    // 将用户的选择写入 .course_config.json 文件
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log(chalk.green(`用户选择已保存到 ${configFile}`));
}

// 调用函数
config();