import { useState, useEffect } from 'react'
import { Typography, Table, Button, Modal, Form, Input, Select, Popconfirm, Space, message } from 'antd'
import { BookOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { getAllMajors, addMajor, deleteMajor } from '../api/majorApi'
import { getAllSchools } from '../api/schoolApi'

export default function MajorPage() {
  const [data, setData] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const loadData = () => {
    setLoading(true)
    Promise.all([getAllMajors(), getAllSchools()])
      .then(([majRes, schRes]) => {
        setData(majRes.data)
        setSchools(schRes.data)
      })
      .catch(() => message.error('获取专业列表失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleAdd = () => {
    form.validateFields().then(values => {
      const payload = {
        majorCode: values.majorCode,
        majorName: values.majorName,
        school: { schoolCode: values.schoolCode },
      }
      addMajor(payload)
        .then(() => {
          message.success('专业创建成功')
          setModalOpen(false)
          form.resetFields()
          loadData()
        })
        .catch(() => message.error('创建失败，专业代码可能已存在'))
    })
  }

  const handleDelete = (majorCode: string) => {
    deleteMajor(majorCode)
      .then(() => {
        message.success('删除成功')
        loadData()
      })
      .catch(() => message.error('删除失败'))
  }

  const schoolOptions = schools.map((s: any) => ({
    value: s.schoolCode,
    label: `${s.schoolName} (${s.schoolCode})`,
  }))

  const columns = [
    { title: '专业代码', dataIndex: 'majorCode', key: 'majorCode', width: 80 },
    { title: '专业名称', dataIndex: 'majorName', key: 'majorName' },
    { title: '所属学院', dataIndex: ['school', 'schoolName'], key: 'school', render: (t: string) => t || '-' },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm title="确定要删除该专业吗？" onConfirm={() => handleDelete(record.majorCode)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <BookOutlined /> 专业管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新增专业
        </Button>
      </Space>
      <Table dataSource={data} columns={columns} rowKey="majorCode" loading={loading} pagination={false} />
      <Modal title="新增专业" open={modalOpen} onOk={handleAdd} onCancel={() => { setModalOpen(false); form.resetFields() }} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="majorCode" label="专业代码" rules={[{ required: true, message: '请输入专业代码' }]}>
            <Input placeholder="例如：78" maxLength={2} />
          </Form.Item>
          <Form.Item name="majorName" label="专业名称" rules={[{ required: true, message: '请输入专业名称' }]}>
            <Input placeholder="例如：软件工程" />
          </Form.Item>
          <Form.Item name="schoolCode" label="所属学院" rules={[{ required: true, message: '请选择所属学院' }]}>
            <Select placeholder="请选择学院" options={schoolOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
