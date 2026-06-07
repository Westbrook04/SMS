import { useState, useEffect } from 'react'
import { Typography, Table, Button, Modal, Form, Input, Select, Popconfirm, Space, message } from 'antd'
import { TeamOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getAllStudents, addStudent, updateStudent, deleteStudent } from '../api/studentApi'
import { getAllClasses } from '../api/classApi'

export default function StudentPage() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [form] = Form.useForm()

  // 加载学生 + 班级列表
  const loadData = () => {
    setLoading(true)
    Promise.all([getAllStudents(), getAllClasses()])
      .then(([stuRes, clsRes]) => {
        setStudents(stuRes.data)
        setClasses(clsRes.data)
      })
      .catch(() => message.error('获取数据失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  // 打开新增弹窗
  const handleOpenAdd = () => {
    setEditingStudent(null)
    form.resetFields()
    setModalOpen(true)
  }

  // 打开编辑弹窗
  const handleOpenEdit = (student: any) => {
    setEditingStudent(student)
    form.setFieldsValue({
      studentName: student.studentName,
      classId: student.studentClass?.classId,
    })
    setModalOpen(true)
  }

  // 保存（新增或编辑）
  const handleSave = () => {
    form.validateFields().then(values => {
      const data = {
        studentName: values.studentName,
        studentClass: values.classId ? { classId: values.classId } : undefined,
      }

      const action = editingStudent
        ? updateStudent(editingStudent.studentId, data)
        : addStudent({ studentId: values.studentId, ...data })

      action
        .then(() => {
          message.success(editingStudent ? '修改成功' : '添加成功')
          setModalOpen(false)
          form.resetFields()
          loadData()
        })
        .catch(() => message.error('操作失败'))
    })
  }

  // 删除学生
  const handleDelete = (studentId: string) => {
    deleteStudent(studentId)
      .then(() => {
        message.success('删除成功')
        loadData()
      })
      .catch(() => message.error('删除失败'))
  }

  const columns = [
    { title: '学号', dataIndex: 'studentId', key: 'studentId', width: 120 },
    { title: '姓名', dataIndex: 'studentName', key: 'studentName' },
    {
      title: '班级',
      dataIndex: ['studentClass', 'className'],
      key: 'className',
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除该学生吗？" onConfirm={() => handleDelete(record.studentId)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const classOptions = classes.map((c: any) => ({
    value: c.classId,
    label: `${c.className} (${c.classId})`,
  }))

  return (
    <div>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <TeamOutlined /> 学生管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
          新增学生
        </Button>
      </Space>

      <Table
        dataSource={students}
        columns={columns}
        rowKey="studentId"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingStudent ? '编辑学生' : '新增学生'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editingStudent && (
            <Form.Item name="studentId" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
              <Input placeholder="例如：2024001" />
            </Form.Item>
          )}
          <Form.Item name="studentName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入学生姓名" />
          </Form.Item>
          <Form.Item name="classId" label="所属班级">
            <Select placeholder="请选择班级" options={classOptions} allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
