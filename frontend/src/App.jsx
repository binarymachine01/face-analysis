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
      // Send the image to the FastAPI backend for analysis
      const response = await axios.post('http://127.0.0.1:8081/analyze-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      setAnalysisResult(response.data);
      setImage(file);  // Save the uploaded image for display
      message.success('Face analysis complete!');
    } catch (error) {
      setLoading(false);
      console.error(error);
      message.error('Failed to analyze the face.');
    }

    return false; // Prevent automatic file upload handling by Ant Design
  };

  const uploadProps = {
    beforeUpload: handleFileUpload,
    showUploadList: false, // Hide the upload list (we only need the file once)
  };

  // If analysisResult is available, extract the details
  const faceData = analysisResult ? analysisResult.faces[0] : null;
  const emotion = faceData ? faceData.emotion.find(e => e.Confidence === Math.max(...faceData.emotion.map(e => e.Confidence))) : null;

  const ageRange = faceData ? `${faceData.age_range.Low} - ${faceData.age_range.High}` : "N/A";

  return (
    <div style={{ padding: '20px' }}>
      <h2>Face Analysis</h2>

      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>

      {loading && <Spin size="large" style={{ marginTop: 20 }} />}

      {image && (
        <Card
          style={{ marginTop: 20 }}
          cover={<img alt="Uploaded Image" src={URL.createObjectURL(image)} />}
        >
          <Meta title="Uploaded Image" description="Face Analysis Results" />
        </Card>
      )}

      {analysisResult && faceData && (
        <div style={{ marginTop: 20 }}>
          <h3>Face Analysis Results:</h3>

          <div>
            <strong>Confidence in Face Detection:</strong> {faceData.confidence.toFixed(2)}%
          </div>

          <div>
            <strong>Dominant Emotion:</strong> {emotion ? emotion.Type : "N/A"} ({emotion ? emotion.Confidence.toFixed(2) : "N/A"}%)
          </div>

          <div>
            <strong>Smile:</strong> {faceData.smile ? "Yes" : "No"}
          </div>

          <div>
            <strong>Age Range:</strong> {ageRange}
          </div>

          <div>
            <strong>Gender:</strong> {faceData.gender}
          </div>

          <div>
            <strong>Mouth Open:</strong> {faceData.mouth_open ? "Yes" : "No"}
          </div>

          <div>
            <strong>Eyes Open:</strong> {faceData.eyes_open ? "Yes" : "No"}
          </div>


        </div>
      )}
    </div>
  );
};

export default FaceAnalysis;
