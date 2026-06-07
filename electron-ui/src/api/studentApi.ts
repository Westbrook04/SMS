import client from './client'

// 1. 获取所有学生
export const getAllStudents = () => {
    return client.get('/api/students')
}

// 2. 根据学号获取单个学生
export const getStudentById = (studentId: string) => {
    return client.get(`/api/students/${studentId}`)
}

// 3. 新增学生
export const addStudent = (student: { studentId: string; studentName: string }) => {
    return client.post('/api/students', student)
}

// 4. 修改学生
export const updateStudent = (studentId: string, student: { studentName: string }) => {
    return client.put(`/api/students/${studentId}`, student)
}

// 5. 删除学生
export const deleteStudent = (studentId: string) => {
    return client.delete(`/api/students/${studentId}`)
}
