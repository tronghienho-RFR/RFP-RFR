import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import './CVUpdater.css';

const emptyProject = {
    name: '',
    scale: '',
    role: '',
    period: '',
    description: '',
    tech: '',
    result: '',
};

const parseProjectsFromText = (text) => {
    if (!text) return [];

    const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const projects = [];
    let current = null;

    const pushCurrent = () => {
        if (!current) return;
        if (current.name || current.description || current.role) {
            projects.push({ ...emptyProject, ...current });
        }
        current = null;
    };

    lines.forEach((line) => {
        const normalized = line.toLowerCase();

        if (/^(tên dự án|project name)\s*[:\-]/i.test(line)) {
            pushCurrent();
            current = { ...emptyProject, name: line.split(/[:\-]/).slice(1).join(':').trim() };
            return;
        }

        if (!current && /^\d+[.)]\s+/.test(line)) {
            pushCurrent();
            current = { ...emptyProject, name: line.replace(/^\d+[.)]\s+/, '').trim() };
            return;
        }

        if (!current) return;

        if (/^(quy mô|scale)\s*[:\-]/i.test(line)) {
            current.scale = line.split(/[:\-]/).slice(1).join(':').trim();
        } else if (/^(vai trò|role)\s*[:\-]/i.test(line)) {
            current.role = line.split(/[:\-]/).slice(1).join(':').trim();
        } else if (/^(thời gian|period|timeline)\s*[:\-]/i.test(line)) {
            current.period = line.split(/[:\-]/).slice(1).join(':').trim();
        } else if (/^(mô tả|description)\s*[:\-]/i.test(line)) {
            current.description = line.split(/[:\-]/).slice(1).join(':').trim();
        } else if (/^(công nghệ|công cụ|tech|stack)\s*[:\-]/i.test(line)) {
            current.tech = line.split(/[:\-]/).slice(1).join(':').trim();
        } else if (/^(kết quả|result|impact)\s*[:\-]/i.test(line)) {
            current.result = line.split(/[:\-]/).slice(1).join(':').trim();
        } else if (!current.description) {
            current.description = line;
        } else {
            current.description = `${current.description} ${line}`.trim();
        }
    });

    pushCurrent();
    return projects;
};

const toProjectText = (projects) => {
    return projects
        .map(
            (project, index) =>
                `${index + 1}. ${project.name || 'Tên dự án'}\n- Quy mô dự án: ${project.scale || '...'}\n- Vai trò: ${project.role || '...'}\n- Thời gian: ${project.period || '...'}\n- Mô tả: ${project.description || '...'}\n- Công nghệ/Công cụ: ${project.tech || '...'}\n- Kết quả nổi bật: ${project.result || '...'}\n`,
        )
        .join('\n');
};

const mergeProjectsIntoOldCv = (oldCvText, projectsSection) => {
    const headerRegex = /KINH NGHIỆM DỰ ÁN/i;

    if (!oldCvText?.trim()) {
        return `KINH NGHIỆM DỰ ÁN\n${projectsSection}`;
    }

    if (!headerRegex.test(oldCvText)) {
        return `${oldCvText}\n\nKINH NGHIỆM DỰ ÁN\n${projectsSection}`;
    }

    const sectionRegex = /(KINH NGHIỆM DỰ ÁN\s*)([\s\S]*?)(\n[A-ZÀ-Ỵ\s]{4,}:?|$)/i;

    if (sectionRegex.test(oldCvText)) {
        return oldCvText.replace(sectionRegex, (_, headerPart, __, tailPart) => `${headerPart}${projectsSection}${tailPart}`);
    }

    return `${oldCvText}\n\n${projectsSection}`;
};

const CVUpdater = () => {
    const [oldCvText, setOldCvText] = useState('');
    const [oldCvFileName, setOldCvFileName] = useState('');
    const [updateDocText, setUpdateDocText] = useState('');
    const [updateDocFileName, setUpdateDocFileName] = useState('');
    const [projects, setProjects] = useState([]);
    const [updateProjects, setUpdateProjects] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const readUploadedText = async (file) => {
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.txt')) {
            return file.text();
        }

        if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
            throw new Error('DOC_UPLOAD_UNSUPPORTED');
        }

        throw new Error('UNSUPPORTED_TYPE');
    };

    const onUploadOldCv = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setErrorMessage('');

        try {
            const text = await readUploadedText(file);
            setOldCvText(text);
            setOldCvFileName(file.name);

            const detectedProjects = parseProjectsFromText(text);
            if (detectedProjects.length) {
                setProjects(detectedProjects);
            }
        } catch (error) {
            if (error.message === 'DOC_UPLOAD_UNSUPPORTED') {
                setErrorMessage('File Word (.doc/.docx) đã upload thành công nhưng trình duyệt chưa đọc trực tiếp được nội dung. Vui lòng mở Word, copy nội dung và dán vào ô bên dưới (hoặc lưu dạng .txt rồi upload).');
                setOldCvText('');
                setOldCvFileName(file.name);
                return;
            }

            setErrorMessage('Không đọc được file CV cũ. Vui lòng kiểm tra file và thử lại.');
        }
    };

    const onUploadUpdateDoc = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setErrorMessage('');

        try {
            const text = await readUploadedText(file);
            setUpdateDocText(text);
            setUpdateDocFileName(file.name);
            setUpdateProjects(parseProjectsFromText(text));
        } catch (error) {
            if (error.message === 'DOC_UPLOAD_UNSUPPORTED') {
                setErrorMessage('File Word (.doc/.docx) đã upload thành công nhưng trình duyệt chưa đọc trực tiếp được nội dung. Vui lòng mở Word, copy nội dung và dán vào ô bên dưới (hoặc lưu dạng .txt rồi upload).');
                setUpdateDocText('');
                setUpdateDocFileName(file.name);
                setUpdateProjects([]);
                return;
            }

            setErrorMessage('Không đọc được file cập nhật. Vui lòng kiểm tra file và thử lại.');
        }
    };

    const addProject = () => setProjects((prev) => [...prev, { ...emptyProject }]);

    const updateProject = (index, field, value) => {
        setProjects((prev) => prev.map((project, i) => (i === index ? { ...project, [field]: value } : project)));
    };

    const removeProject = (index) => {
        setProjects((prev) => prev.filter((_, i) => i !== index));
    };

    const importProjectFromStep2 = (project) => {
        setProjects((prev) => [...prev, { ...project }]);
    };

    const projectsSection = useMemo(() => toProjectText(projects), [projects]);
    const generatedCv = useMemo(() => mergeProjectsIntoOldCv(oldCvText, projectsSection), [oldCvText, projectsSection]);

    const downloadWord = () => {
        const escapedText = generatedCv
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>');

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;">${escapedText}</body></html>`;
        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `cv_rfr_updated.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div className="cv-updater-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <header className="cv-header">
                <h1 className="text-h1">Cập nhật CV theo 2 file Word</h1>
                <p className="text-muted">
                    Bước 1 upload CV cũ làm mẫu RFR. Bước 2 upload file thông tin cập nhật để chọn xoá/chỉnh/sửa/thêm dự án.
                </p>
            </header>

            {errorMessage && <div className="cv-alert">{errorMessage}</div>}

            <section className="card cv-card">
                <h2 className="text-h3">Bước 1 - Upload file CV cũ (.doc/.docx/.txt)</h2>
                <input type="file" accept=".doc,.docx,.txt" onChange={onUploadOldCv} />
                <p className="text-muted">File đã chọn: {oldCvFileName || 'Chưa có file'}</p>
                <textarea
                    rows={8}
                    value={oldCvText}
                    onChange={(event) => setOldCvText(event.target.value)}
                    placeholder="Nội dung CV cũ sẽ hiển thị tại đây sau khi upload"
                />
            </section>

            <section className="card cv-card">
                <h2 className="text-h3">Bước 2 - Upload file thông tin cập nhật (.doc/.docx/.txt)</h2>
                <input type="file" accept=".doc,.docx,.txt" onChange={onUploadUpdateDoc} />
                <p className="text-muted">File đã chọn: {updateDocFileName || 'Chưa có file'}</p>
                <textarea
                    rows={6}
                    value={updateDocText}
                    onChange={(event) => setUpdateDocText(event.target.value)}
                    placeholder="Nội dung file cập nhật sẽ hiển thị tại đây sau khi upload"
                />

                {updateProjects.length > 0 && (
                    <div className="import-list">
                        <h3>Dự án đọc được từ file bước 2</h3>
                        {updateProjects.map((project, index) => (
                            <div key={`${project.name}-${index}`} className="import-item">
                                <div>
                                    <strong>{project.name || `Dự án ${index + 1}`}</strong>
                                    <p className="text-muted">{project.scale || project.description || 'Không có mô tả'}</p>
                                </div>
                                <button className="btn btn-primary" type="button" onClick={() => importProjectFromStep2(project)}>
                                    Thêm vào CV mới
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="card cv-card">
                <div className="project-header-row">
                    <h2 className="text-h3">Danh sách dự án trên CV mới (xóa/chỉnh/sửa/thêm)</h2>
                    <button className="btn btn-primary" type="button" onClick={addProject}>+ Thêm dự án trống</button>
                </div>

                {projects.length === 0 && <p className="text-muted">Chưa có dự án. Hãy upload file hoặc thêm thủ công.</p>}

                {projects.map((project, index) => (
                    <div key={`project-${index}`} className="project-block">
                        <div className="project-title-row">
                            <h3>Dự án #{index + 1}</h3>
                            <button className="btn btn-ghost" type="button" onClick={() => removeProject(index)}>
                                Xóa dự án
                            </button>
                        </div>

                        <div className="cv-grid">
                            <label>
                                Tên dự án
                                <input value={project.name} onChange={(e) => updateProject(index, 'name', e.target.value)} />
                            </label>
                            <label>
                                Quy mô dự án
                                <input value={project.scale} onChange={(e) => updateProject(index, 'scale', e.target.value)} />
                            </label>
                            <label>
                                Vai trò
                                <input value={project.role} onChange={(e) => updateProject(index, 'role', e.target.value)} />
                            </label>
                            <label>
                                Thời gian
                                <input value={project.period} onChange={(e) => updateProject(index, 'period', e.target.value)} />
                            </label>
                        </div>

                        <label>
                            Mô tả
                            <textarea
                                rows={3}
                                value={project.description}
                                onChange={(e) => updateProject(index, 'description', e.target.value)}
                            />
                        </label>
                        <label>
                            Công nghệ / Công cụ
                            <input value={project.tech} onChange={(e) => updateProject(index, 'tech', e.target.value)} />
                        </label>
                        <label>
                            Kết quả
                            <textarea rows={2} value={project.result} onChange={(e) => updateProject(index, 'result', e.target.value)} />
                        </label>
                    </div>
                ))}
            </section>

            <section className="card cv-card">
                <div className="preview-header-row">
                    <h2 className="text-h3">CV mới sau khi cập nhật</h2>
                    <button className="btn btn-primary" type="button" onClick={downloadWord} disabled={!generatedCv.trim()}>
                        Xuất Word CV mới
                    </button>
                </div>
                <pre className="cv-preview">{generatedCv || 'Upload CV cũ và thêm dự án để tạo CV mới.'}</pre>
            </section>
        </motion.div>
    );
};

export default CVUpdater;
