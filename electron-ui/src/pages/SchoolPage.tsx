import { useState, useEffect } from 'react'
import { Typography, Table, Button, Modal, Form, Input, Popconfirm, Space, message } from 'antd'
import { BankOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { getAllSchools, addSchool, deleteSchool } from '../api/schoolApi'

export default function SchoolPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const loadData = () => {
    setLoading(true)
    getAllSchools()
      .then(res => setData(res.data))
      .catch(() => message.error('获取学院列表失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleAdd = () => {
    form.validateFields().then(values => {
      addSchool(values)
        .then(() => {
          message.success('学院创建成功')
          setModalOpen(false)
          form.resetFields()
          loadData()
        })
        .catch(() => message.error('创建失败，学院代码可能已存在'))
    })
  }

  const handleDelete = (schoolCode: string) => {
    deleteSchool(schoolCode)
      .then(() => {
        message.success('删除成功')
        loadData()
      })
      .catch(() => message.error('删除失败'))
  }

  const columns = [
    { title: '学院代码', dataIndex: 'schoolCode', key: 'schoolCode', width: 100 },
    { title: '学院名称', dataIndex: 'schoolName', key: 'schoolName' },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm title="确定要删除该学院吗？" onConfirm={() => handleDelete(record.schoolCode)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <BankOutlined /> 学院管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新增学院
        </Button>
      </Space>
      <Table dataSource={data} columns={columns} rowKey="schoolCode" loading={loading} pagination={false} />
      <Modal title="新增学院" open={modalOpen} onOk={handleAdd} onCancel={() => { setModalOpen(false); form.resetFields() }} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="schoolCode" label="学院代码" rules={[{ required: true, message: '请输入学院代码' }]}>
            <Input placeholder="例如：57" maxLength={2} />
          </Form.Item>
          <Form.Item name="schoolName" label="学院名称" rules={[{ required: true, message: '请输入学院名称' }]}>
            <Input placeholder="例如：能源与机械工程学院" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
