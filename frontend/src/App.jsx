// src/components/FaceAnalysis.js
import React, { useState } from 'react';
import { Upload, Button, message, Spin, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Meta } = Card;

const FaceAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      // Send the image to the FastAPI backend
      const response = await axios.post('http://127.0.0.1:8081/analyze-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      setAnalysisResult(response.data);
      message.success('Face analysis complete!');
    } catch (error) {
      setLoading(false);
      console.log(error)
      message.error('Failed to analyze the face.');
    }

    return false; // Prevent automatic file upload handling by Ant Design
  };

  const uploadProps = {
    beforeUpload: handleFileUpload,
    showUploadList: false, // Hide the upload list (we only need the file once)
  };

  return (
    <div>
      <h2>Face Analysis</h2>

      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>

      {loading && <Spin size="large" />}

      {image && (
        <Card
          style={{ marginTop: 20 }}
          cover={<img alt="Uploaded Image" src={URL.createObjectURL(image)} />}
        >
          <Meta title="Uploaded Image" description="Face Analysis Results" />
        </Card>
      )}

      {analysisResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Face Analysis Results:</h3>
          <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FaceAnalysis;
