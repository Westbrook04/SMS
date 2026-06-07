import client from './client'

export interface SchoolInput {
  schoolCode: string
  schoolName: string
}

export const getAllSchools = () => {
  return client.get('/api/schools')
}

export const addSchool = (data: SchoolInput) => {
  return client.post('/api/schools', data)
}

export const deleteSchool = (schoolCode: string) => {
  return client.delete(`/api/schools/${schoolCode}`)
}
