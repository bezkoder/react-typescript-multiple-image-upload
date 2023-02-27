import { useState, useEffect, useRef } from "react";
import UploadService from "../services/FileUploadService";
import IFile from "../types/File";

interface ProgressInfo {
  fileName: string;
  percentage: number;
}

const ImagesUpload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<Array<string>>([]);
  const [progressInfos, setProgressInfos] = useState<Array<ProgressInfo>>([]);
  const [message, setMessage] = useState<Array<string>>([]);
  const [imageInfos, setImageInfos] = useState<Array<IFile>>([]);
  const progressInfosRef = useRef<any>(null);

  useEffect(() => {
    UploadService.getFiles().then((response) => {
      setImageInfos(response.data);
    });
  }, []);

  const selectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    let images: Array<string> = [];
    let files = event.target.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        images.push(URL.createObjectURL(files[i]));
      }
  
      setSelectedFiles(files);
      setImagePreviews(images);
      setProgressInfos([]);
      setMessage([]);
    }
  };

  const upload = (idx: number, file: File) => {
    let _progressInfos = [...progressInfosRef.current];
    return UploadService.upload(file, (event) => {
      _progressInfos[idx].percentage = Math.round(
        (100 * event.loaded) / event.total
      );
      setProgressInfos(_progressInfos);
    })
      .then(() => {
        setMessage((prevMessage) => [
          ...prevMessage,
          file.name + ": Successful!"
        ]);
      })
      .catch((err: any) => {
        _progressInfos[idx].percentage = 0;
        setProgressInfos(_progressInfos);

        let msg = file.name + ": Failed!";
        if (err.response && err.response.data && err.response.data.message) {
          msg += " " + err.response.data.message;
        }

        setMessage((prevMessage) => [
          ...prevMessage,
          msg
        ]);
      });
  };

  const uploadImages = () => {
    if (selectedFiles != null) {
      const files = Array.from(selectedFiles);

      let _progressInfos = files.map((file) => ({
        percentage: 0,
        fileName: file.name
      }));

      progressInfosRef.current = _progressInfos;

      const uploadPromises = files.map((file, i) => upload(i, file));

      Promise.all(uploadPromises)
        .then(() => UploadService.getFiles())
        .then((images) => {
          setImageInfos(images.data);
        });

      setMessage([]);
    }
  };

  return (
    <div>
      {progressInfos &&
        progressInfos.length > 0 &&
        progressInfos.map((progressInfo: ProgressInfo, index: number) => (
          <div className="mb-2" key={index}>
            <span>{progressInfo.fileName}</span>
            <div className="progress">
              <div
                className="progress-bar progress-bar-info"
                role="progressbar"
                aria-valuenow={progressInfo.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: progressInfo.percentage + "%" }}
              >
                {progressInfo.percentage}%
              </div>
            </div>
          </div>
        ))}

      <div className="row my-3">
        <div className="col-8">
          <label className="btn btn-default p-0">
            <input type="file" multiple accept="image/*" onChange={selectImages} />
          </label>
        </div>

        <div className="col-4">
          <button
            className="btn btn-success btn-sm"
            disabled={!selectedFiles}
            onClick={uploadImages}
          >
            Upload
          </button>
        </div>
      </div>

      {imagePreviews && (
        <div>
          {imagePreviews.map((img, i) => {
            return (
              <img className="preview" src={img} alt={"image-" + i} key={i} />
            );
          })}
        </div>
      )}

      {message.length > 0 && (
        <div className="alert alert-secondary mt-2" role="alert">
          <ul>
            {message.map((item, i) => {
              return <li key={i}>{item}</li>;
            })}
          </ul>
        </div>
      )}

      {imageInfos.length > 0 && (
        <div className="card mt-3">
          <div className="card-header">List of Images</div>
          <ul className="list-group list-group-flush">
            {imageInfos.map((img, index) => (
              <li className="list-group-item" key={index}>
                <p>
                  <a href={img.url}>{img.name}</a>
                </p>
                <img src={img.url} alt={img.name} height="80px" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImagesUpload;
