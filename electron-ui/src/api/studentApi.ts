import client from './client'

// 学生输入类型（新增/编辑时使用）
export interface StudentInput {
  studentId?: string
  studentName: string
  studentClass?: { classId: string }
}

// 1. 获取所有学生
export const getAllStudents = () => {
  return client.get('/api/students')
}

// 2. 根据学号获取单个学生
export const getStudentById = (studentId: string) => {
  return client.get(`/api/students/${studentId}`)
}

// 3. 添加学生
export const addStudent = (student: StudentInput) => {
  return client.post('/api/students', student)
}

// 4. 修改学生
export const updateStudent = (studentId: string, student: StudentInput) => {
  return client.put(`/api/students/${studentId}`, student)
}

// 5. 删除学生
export const deleteStudent = (studentId: string) => {
  return client.delete(`/api/students/${studentId}`)
}
