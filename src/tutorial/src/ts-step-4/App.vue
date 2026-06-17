<script setup lang="ts">
// ====== 1. 接口描述对象的形状 ======
interface Student {
  name: string
  age: number
  major: string
  score?: number   // 可选属性
}

const student: Student = {
  name: '小明',
  age: 20,
  major: '计算机科学'
}
console.log('student:', student)

// ❌ 取消下面注释，TS 立刻报错
// const bad: Student = { name: '小刚' }   // 缺少 age 和 major
// const bad2: Student = { name: '小刚', age: 20, major: '数学', height: 175 }   // 多了 height

// ====== 2. 接口用于函数参数 ======
function printStudent(s: Student): void {
  console.log(`${s.name}，${s.age}岁，${s.major}专业` + (s.score !== undefined ? `（成绩 ${s.score}）` : ''))
}
printStudent(student)
printStudent({ name: '小红', age: 19, major: '软件', score: 95 })

// ====== 3. 嵌套接口 ======
interface Course {
  name: string
  teacher: string
  students: Student[]
}

const course: Course = {
  name: '移动开发技术',
  teacher: '常老师',
  students: [
    { name: '小明', age: 20, major: '计算机' },
    { name: '小红', age: 19, major: '软件' }
  ]
}
console.log(`课程：${course.name} - ${course.teacher}，共 ${course.students.length} 人`)
course.students.forEach(printStudent)

// ====== 4. 接口继承 ======
interface Person {
  name: string
  age: number
}

interface Teacher extends Person {
  subject: string
  yearsOfExperience: number
}

const t: Teacher = {
  name: '张老师',
  age: 35,
  subject: '前端开发',
  yearsOfExperience: 10
}
console.log(`${t.name} 教 ${t.subject}，${t.yearsOfExperience} 年经验`)
</script>

<template>
  <div style="padding: 20px; font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8;">
    <h1>interface 接口</h1>
    <p>看右下方 <b>console</b>。</p>
    <p>取消 <code>// const bad: Student = { name: '小刚' }</code> 看 TS 报"缺少属性"。</p>
  </div>
</template>
