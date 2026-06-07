import {Table, Typography} from 'antd'
import {BookOutlined, TeamOutlined} from '@ant-design/icons'
import {useEffect, useState} from "react";
import {getAllClasses} from "../api/classApi";

export default function ClassPage() {

    // 1. 声明一个箱子（state）来存放学生数据，初始值是空数组
    const [classes, setClasses] = useState([])

    // 2. 页面一加载，自动去取数据
    useEffect(() => {
        getAllClasses()
            .then(res => {
                setClasses(res.data)  // 把取到的数据放进箱子
            })
            .catch(err => {
                console.error('获取班级列表失败:', err)
            })
    }, [])  // 空数组 = 只在页面第一次加载时执行

    // 3. 定义表格的列
    const columns = [
        { title: '班级编号', dataIndex: 'classId', key: 'classId' },
        { title: '班级', dataIndex: 'className', key: 'classId' },
        { title: '班级人数', dataIndex: 'studentCount', key: 'studentCount' },
    ]

    return (
        <div>
            <Typography.Title level={3}>
                <TeamOutlined /> 班级管理
            </Typography.Title>
            <Table
                dataSource={classes}
                columns={columns}
                rowKey="classId"
                pagination={false}
            />
        </div>
    )
}
