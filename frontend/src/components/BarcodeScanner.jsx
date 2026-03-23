import { useRef } from 'react';

function RegisterForm({
  barcode,
  purchaseDate,
  status,
  error,
  onBarcodeChange,
  onPurchaseDateChange,
  onSubmit,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // カメラ起動
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  // 撮影して送信
  const captureAndSend = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageSrc = canvas.toDataURL('image/png');

    try {
      const response = await fetch('/api/scan-barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc }),
      });

      const data = await response.json();

      if (data.code) {
        onBarcodeChange(data.code);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="form">
      <label>バーコード(JAN)</label>
      <input
        value={barcode}
        onChange={(event) => onBarcodeChange(event.target.value)}
        placeholder="例: 4901234567896"
      />

      {/* カメラ起動ボタン */}
      <button type="button" onClick={startCamera}>
        カメラ起動
      </button>

      {/* 撮影ボタン */}
      <button type="button" onClick={captureAndSend}>
        撮影して送信
      </button>

      {/* カメラ映像 */}
      <video ref={videoRef} style={{ width: '100%' }} />

      {/* 非表示キャンバス */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <label>購入日</label>
      <input
        type="date"
        value={purchaseDate}
        onChange={(event) => onPurchaseDateChange(event.target.value)}
      />

      <button type="button" onClick={onSubmit}>
        物品を登録
      </button>

      {status && <div className="status">🔥 {status}</div>}
      {error && <div className="error">⚠️ {error}</div>}
    </div>
  );
}

export default RegisterForm;