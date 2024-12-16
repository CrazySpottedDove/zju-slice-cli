import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const cacheDir = path.join(__dirname, '.course_cache')
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir)
}

function readJsonFile(filename, defaultValue) {
    if (fs.existsSync(filename)) {
        return JSON.parse(fs.readFileSync(filename, 'utf-8'))
    }
    fs.writeFileSync(filename, JSON.stringify(defaultValue))
    return defaultValue
}


function readAllConfigs() {
    const coursesDir = readJsonFile(path.join(cacheDir, 'location.json'), { location: path.join(__dirname, 'courses-fetched') }).location
    const userConfig = readJsonFile(path.join(cacheDir, 'userConfig.json'), { split: true })
    const split = userConfig.split
    const userAccount = readJsonFile(path.join(cacheDir, 'userAccount.json'), { username: '', password: '' })
    const { username, password } = userAccount
    const courseConfig = readJsonFile(path.join(cacheDir, 'courseConfig.json'), {})
    // 保证coursesDir是安全的
    if (!fs.existsSync(coursesDir)) {
        fs.mkdirSync(coursesDir)
    }
    const linkCache = readJsonFile(path.join(cacheDir, 'linkCache.json'), [])
    const titleCache = readJsonFile(path.join(cacheDir, 'titleCache.json'), [])
    const courses = readJsonFile(path.join(cacheDir, 'courses.json'), [])
    return {
        coursesDir: coursesDir,
        split: split,
        username: username,
        password: password,
        courseConfig: courseConfig,
        linkCache: linkCache,
        titleCache: titleCache,
        courses: courses,
        userConfig: userConfig
    }
}
export {
    readAllConfigs,
    cacheDir,
    __dirname
}