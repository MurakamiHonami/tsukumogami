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
  console.log("RegisterForm読み込まれた");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // カメラ起動
  const startCamera = async () => {
    console.log("カメラ起動");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("取得成功");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("カメラエラー", err);
    }
  };

  // 撮影して送信
  const captureAndSend = async () => {
    console.log("撮影ボタン押された");

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      console.log("まだカメラ準備できてない");
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const imageSrc = canvas.toDataURL('image/png');
    console.log("画像取得OK");

    try {
      const response = await fetch('/api/scan-barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc }),
      });

      console.log("API送信OK", response);

      const data = await response.json();
      console.log("結果", data);

      if (data.code) {
        onBarcodeChange(data.code);
      } else {
        console.log("コードが取得できなかった");
      }
    } catch (err) {
      console.error("送信エラー", err);
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

      {/* カメラ起動 */}
      <button type="button" onClick={startCamera}>
        カメラ起動
      </button>

      {/* 撮影 */}
      <button type="button" onClick={captureAndSend}>
        撮影して送信
      </button>

      {/* カメラ映像 */}
      <video ref={videoRef} style={{ width: '100%' }} />

      {/* 非表示canvas */}
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