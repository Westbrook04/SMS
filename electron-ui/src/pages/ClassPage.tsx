import { Table, Typography, Button, Modal, Form, Input, Popconfirm, Space, message } from 'antd'
import { BookOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useState } from "react"
import { getAllClasses, addClass, deleteClass } from "../api/classApi"

export default function ClassPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  // 加载班级列表
  const loadClasses = () => {
    setLoading(true)
    getAllClasses()
      .then(res => setClasses(res.data))
      .catch(() => message.error('获取班级列表失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadClasses() }, [])

  // 新增班级
  const handleAdd = () => {
    form.validateFields().then(values => {
      addClass(values)
        .then(() => {
          message.success('班级创建成功')
          setModalOpen(false)
          form.resetFields()
          loadClasses()
        })
        .catch(() => message.error('创建失败，请检查班级编号是否重复'))
    })
  }

  // 删除班级
  const handleDelete = (classId: string) => {
    deleteClass(classId)
      .then(() => {
        message.success('删除成功')
        loadClasses()
      })
      .catch(() => message.error('删除失败，该班级下还有学生'))
  }

  const columns = [
    { title: '班级编号', dataIndex: 'classId', key: 'classId', width: 120 },
    { title: '班级名称', dataIndex: 'className', key: 'className' },
    { title: '班级人数', dataIndex: 'studentCount', key: 'studentCount', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm
          title="确定要删除这个班级吗？"
          description="如果班级下有学生，删除会失败"
          onConfirm={() => handleDelete(record.classId)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <BookOutlined /> 班级管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新增班级
        </Button>
      </Space>

      <Table
        dataSource={classes}
        columns={columns}
        rowKey="classId"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="新增班级"
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="classId" label="班级编号" rules={[{ required: true, message: '请输入班级编号' }]}>
            <Input placeholder="例如：CS2024" />
          </Form.Item>
          <Form.Item name="className" label="班级名称" rules={[{ required: true, message: '请输入班级名称' }]}>
            <Input placeholder="例如：计算机科学与技术2024班" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
