import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { cacheDir, readAllConfigs } from './share/reader.js';
const { courses } = readAllConfigs();
const courseConfigFile = path.join(cacheDir, 'courseConfig.json');
async function config() {

    // 获取所有学期
    const semesters = [...new Set(courses.map(course => course.semester))];

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

    const courseConfig = {};
    for (const semester of selectedSemesters) {
        // 获取该学期的所有课程
        const coursesInSemester = courses.filter(course => course.semester === semester);

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

        // 将用户的选择按学期分类，并写入 {name, link}
        courseConfig[semester] = selectedCourseNames.map(courseName => {
            const course = coursesInSemester.find(course => course.name === courseName);
            return { name: course.name, link: course.link };
        });
    }

    // 将用户的选择写入 .course_config.json 文件
    fs.writeFileSync(courseConfigFile, JSON.stringify(courseConfig, null, 2));
    console.log(chalk.green(`用户选择已保存到 ${courseConfigFile}`));
}

// 调用函数
config();