import { useState, useEffect } from 'react'
import { Typography, Table } from 'antd'
import { TeamOutlined } from '@ant-design/icons'
import { getAllStudents } from '../api/studentApi'

export default function StudentPage() {
    // 1. 声明一个箱子（state）来存放学生数据，初始值是空数组
    const [students, setStudents] = useState([])

    // 2. 页面一加载，自动去取数据
    useEffect(() => {
        getAllStudents()
            .then(res => {
                setStudents(res.data)  // 把取到的数据放进箱子
            })
            .catch(err => {
                console.error('获取学生列表失败:', err)
            })
    }, [])  // 空数组 = 只在页面第一次加载时执行

    // 3. 定义表格的列
    const columns = [
        { title: '学号', dataIndex: 'studentId', key: 'studentId' },
        { title: '姓名', dataIndex: 'studentName', key: 'studentName' },
        { title: '班级', dataIndex: ['studentClass', 'className'], key: 'className' },
    ]


    return (
    <div>
      <Typography.Title level={3}>
        <TeamOutlined /> 学生管理
      </Typography.Title>
     <Table
         dataSource={students}
         columns={columns}
         rowKey="studentId"
         pagination={false}
     />
    </div>
  )
}
