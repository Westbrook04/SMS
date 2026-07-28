import client from './client'

// 1. 获取所有班级
export const getAllClasses = () => {
    return client.get('/api/classes')
}

// 2. 获取单个班级
export const getClassById = (classId: string) => {
    return client.get(`/api/classes/${classId}`)
}

// 3. 新增班级
export const addClass = (classData: { classId: string; className: string }) => {
    return client.post('/api/classes', classData)
}

// 4. 删除班级
export const deleteClass = (classId: string) => {
    return client.delete(`/api/classes/${classId}`)
}
