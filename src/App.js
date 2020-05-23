import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Switch,
  Tooltip,
  Button,
  Modal,
  Form,
  Input,
  Divider,
  Row,
  Col,
  Upload,
  Space,
  Typography
} from "antd";
import { PlusOutlined, ExportOutlined, UploadOutlined } from "@ant-design/icons";
import MonacoEditor from "react-monaco-editor";

import terrFormLogo from "./assets/img/terraform-logo.png";
import _ from "underscore";
function App() {
  const { Search } = Input;
  const { Title } = Typography;
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 24 },
  };
  const options = {
    lineNumbers: "off",
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    readOnly: false,
  };
  
  const getOptionList = () => {
    return localStorage.getItem("optionList")
    ? JSON.parse(localStorage.getItem("optionList"))
    : []
  } 
  useEffect(()=>{
    
      fetch("/Terrafrom-Generator/master/_lrinc12fe.json")
        .then(res => res.json())
        .then(
          (result) => {
            if(result) {
              updateOption(result);
              updateGeneratedCode(result);
            }else {
              alert('Error on Fetching Template');
            }
          },
         (error) => {
            alert('Error on Fetching Template');
          }
        )
    
  },[])
  
  
  
  const [form] = Form.useForm();
  const [optionItem, setOptionItem] = useState([]);
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState();
  const [editedVal, setEditedVal] = useState();

  const onSwitchChange = (e, item) => {
    let formData = [];
    formData = optionItem;
    const findedIndex = findOptionIndex(formData, item.id);
    if (findedIndex !== -1) {
      console.log("e", e);
      formData[findedIndex].isChecked = e;
    }
    console.log("formData", formData);
    updateGeneratedCode(formData);
    updateOption(formData);
  };

  const updateGeneratedCode = (formData) => {
    let genCode = "";
    for (let obj of formData) {
      if (obj.isChecked) {
        if (genCode !== "") {
          genCode += `\n\n`;
        }
        genCode += `${obj.code}`;
      }
    }
    setGeneratedCode(genCode);
    console.log("genCode", genCode);
  };

  const onOptionDialog = () => {
    setShowOptionDialog(true);
  };

  const dialogCancel = () => {
    setShowOptionDialog(false);
    onReset();
  };

  const uniqID = () => {
    return "_" + Math.random().toString(36).substr(2, 9);
  };

  const findOptionIndex = (formData, id) => {
    return _.findIndex(formData, (item) => item.id === id);
  };
  const handleSubmit = () => {
    setShowOptionDialog(false);
    let formData = [];
    if (editedVal) {
      formData = optionItem;
      const formObj = { ...editedVal, ...form.getFieldsValue() };
      const findedIndex = findOptionIndex(formData, formObj.id);
      if (findedIndex !== -1) {
        formData[findedIndex] = formObj;
      }
    } else {
      formData = [...optionItem, { ...form.getFieldsValue(), id: uniqID() }];
    }
    updateOption(formData);
    onReset();
  };

  const updateOption = (formData) => {
    setOptionItem(formData);
    localStorage.setItem("optionList", JSON.stringify(formData));
  };

  const onFinish = (values) => {
    console.log(values);
  };

  const onReset = () => {
    form.resetFields();
    setEditedVal(null);
  };
  const onOptionEdit = (e, item) => {
    e.preventDefault();
    setShowOptionDialog(true);
    form.setFieldsValue(item);
    setEditedVal(item);
  };
  const editorDidMount = (editor, monaco) => {
    console.log("editorDidMount", editor);
    editor.focus();
  };

  const onGeneratedMount = (editor, monaco) => {
    console.log("editorDidMount", editor);
    updateGeneratedCode(optionItem);
    editor.focus();
  };
  const onEditorChange = (newValue, e) => {
    form.setFieldsValue({
      code: newValue,
    });
  };
  const onSave = () => {
    var json = localStorage.getItem("optionList");
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.download = `${uniqID()}.json`;
    a.href = url;
    a.click();
  };

  const isNameAvailable = (obj,query) => {
    return obj.oname.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  }
  const onSearch = (query) => {
    let optionList =  getOptionList();
    if(query !== '' && query !== null && query !== undefined ) {
      let filterArr = [];
      
      for(let obj of optionList) {
        if(isNameAvailable(obj,query)) {
          filterArr.push(obj);
        };
      }
      setOptionItem(filterArr);
      console.log('filterArr',filterArr);
    }else {
      setOptionItem(optionList);
    }
  }

  const getBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsText(file);
  }

  const onFileChange = (info) => {
    getBase64(info.file, (data) => {
      // console.log('data',JSON.parse(data));
      if(data) {
        const optionItemListData = JSON.parse(data);
        updateOption(optionItemListData);
        updateGeneratedCode(optionItemListData);
      }
    });
  }
  return (
    <>
      <div className="app-wrapper">
        <div className="app-container">
          <header className="header-area">
            <img src={terrFormLogo} alt="Terraform Logo" />
            <span>Terraform Generator</span>
          </header>
          <div className="view-sample-block">
            <a href="https://github.com/kalaiarasan33/Terrafrom-Generator/blob/master/_lrinc12fe.json" target="_blank" className="tf-sample-link" rel="noopener noreferrer">Download Template Dump</a>
          </div>
          <section className="section-area">
            
            <div className="editor-area">
              <Card
                title={
                  
                  <Title level={4}>Code</Title>
                }
                className="editor-card"
               
              >
                <MonacoEditor
                  options={options}
                  value={generatedCode}
                  editorDidMount={onGeneratedMount}
                />
              </Card>
            </div>
            <div className="sidebar-area">
              <Card
                title={
                  <Space>
                    <Title level={4}>Options</Title>
                    <Tooltip title="Export">
                      <Button
                        shape="circle"
                        icon={<ExportOutlined />}
                        onClick={onSave}
                      />
                  </Tooltip>
                  </Space>
                  
                }
                className="sidebar-card"
                extra={
                  <>
                  <Space>
                  <Upload  beforeUpload={() => false} onChange={onFileChange} showUploadList={false} accept=".json">
                      <Tooltip title="Import Template">
                        <Button
                          icon={<UploadOutlined />}
                        />
                      </Tooltip>
                    </Upload>
                    <Tooltip title="Add Option">
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={onOptionDialog}
                      />
                    </Tooltip>
                  </Space>
                </>
                }
              >
                <Row justify="center">
                  <Col span={22}>
                    <Search
                      placeholder="Search Options"
                      onSearch={(value) => onSearch(value)}
                      enterButton
                    
                    />
                  </Col>
                </Row>
                <div className="list-box">
                <List
                  size="large"
                  dataSource={optionItem}
                  className="sidebar-option-list"
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <a href="#" onClick={(e) => onOptionEdit(e, item)}>
                          Edit
                        </a>,
                      ]}
                    >
                      <Switch
                        defaultChecked={item.isChecked}
                        onChange={(e) => onSwitchChange(e, item)}
                      />{" "}
                      {item.oname}
                    </List.Item>
                  )}
                />
                </div>
                
              </Card>
            </div>

            <Modal
              title="New Option"
              visible={showOptionDialog}
              onCancel={dialogCancel}
              width={700}
              footer={[
                <Button key="submit" type="primary" onClick={handleSubmit}>
                  Submit
                </Button>,
              ]}
            >
              <Form
                {...layout}
                layout="vertical"
                initialValues={{ oname: "", code: "" }}
                size="middle"
                form={form}
                onFinish={onFinish}
              >
                <Form.Item
                  label="Option Name"
                  name="oname"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the Option Name!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Divider />
                <Form.Item
                  label="Code"
                  name="code"
                  rules={[
                    { required: true, message: "Please enter the code!" },
                  ]}
                >
                  <MonacoEditor
                    height="300"
                    options={options}
                    onChange={onEditorChange}
                    editorDidMount={editorDidMount}
                  />
                </Form.Item>
              </Form>
            </Modal>
          </section>
        </div>
      </div>
    </>
  );
}

export default App;
