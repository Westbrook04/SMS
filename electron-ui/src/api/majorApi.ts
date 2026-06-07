import client from './client'

export interface MajorInput {
  majorCode: string
  majorName: string
  school?: { schoolCode: string }
}

export const getAllMajors = () => {
  return client.get('/api/majors')
}

export const getMajorsBySchool = (schoolCode: string) => {
  return client.get(`/api/majors/by-school/${schoolCode}`)
}

export const addMajor = (data: MajorInput) => {
  return client.post('/api/majors', data)
}

export const deleteMajor = (majorCode: string) => {
  return client.delete(`/api/majors/${majorCode}`)
}
