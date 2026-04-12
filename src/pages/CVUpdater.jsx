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


const readUInt16 = (view, offset) => view.getUint16(offset, true);
const readUInt32 = (view, offset) => view.getUint32(offset, true);

const decodeWordXml = (xmlText) => {
    return xmlText
        .replace(/<w:tab\/?\s*>/g, '\t')
        .replace(/<w:br\/?\s*>/g, '\n')
        .replace(/<w:p[^>]*>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const inflateRaw = async (bytes) => {
    if (typeof DecompressionStream === 'undefined') {
        throw new Error('DECOMPRESSION_UNSUPPORTED');
    }

    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    const response = new Response(stream);
    return new Uint8Array(await response.arrayBuffer());
};

const extractDocxText = async (arrayBuffer) => {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);

    let eocdOffset = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) {
        if (readUInt32(view, i) === 0x06054b50) {
            eocdOffset = i;
            break;
        }
    }

    if (eocdOffset < 0) {
        throw new Error('DOCX_INVALID_ZIP');
    }

    const centralDirectoryOffset = readUInt32(view, eocdOffset + 16);
    const totalEntries = readUInt16(view, eocdOffset + 10);

    let pointer = centralDirectoryOffset;
    let documentEntry = null;

    for (let i = 0; i < totalEntries; i += 1) {
        if (readUInt32(view, pointer) !== 0x02014b50) {
            throw new Error('DOCX_CENTRAL_DIRECTORY_ERROR');
        }

        const compressionMethod = readUInt16(view, pointer + 10);
        const compressedSize = readUInt32(view, pointer + 20);
        const fileNameLength = readUInt16(view, pointer + 28);
        const extraLength = readUInt16(view, pointer + 30);
        const commentLength = readUInt16(view, pointer + 32);
        const localHeaderOffset = readUInt32(view, pointer + 42);

        const fileNameBytes = bytes.slice(pointer + 46, pointer + 46 + fileNameLength);
        const fileName = new TextDecoder('utf-8').decode(fileNameBytes);

        if (fileName === 'word/document.xml') {
            documentEntry = { compressionMethod, compressedSize, localHeaderOffset };
            break;
        }

        pointer += 46 + fileNameLength + extraLength + commentLength;
    }

    if (!documentEntry) {
        throw new Error('DOCX_DOCUMENT_XML_NOT_FOUND');
    }

    const localOffset = documentEntry.localHeaderOffset;
    if (readUInt32(view, localOffset) !== 0x04034b50) {
        throw new Error('DOCX_LOCAL_HEADER_ERROR');
    }

    const fileNameLength = readUInt16(view, localOffset + 26);
    const extraLength = readUInt16(view, localOffset + 28);
    const dataOffset = localOffset + 30 + fileNameLength + extraLength;
    const compressedData = bytes.slice(dataOffset, dataOffset + documentEntry.compressedSize);

    let xmlBytes;
    if (documentEntry.compressionMethod === 0) {
        xmlBytes = compressedData;
    } else if (documentEntry.compressionMethod === 8) {
        xmlBytes = await inflateRaw(compressedData);
    } else {
        throw new Error('DOCX_COMPRESSION_UNSUPPORTED');
    }

    const xmlText = new TextDecoder('utf-8').decode(xmlBytes);
    return decodeWordXml(xmlText);
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

        if (/^[-•]\s+/.test(line)) {
            const bulletText = line.replace(/^[-•]\s+/, '').trim();

            if (!bulletText) return;

            if (/(with\s+scale|gfa|area\s+land|floors?|basements?|renovation)/i.test(bulletText)) {
                const mainName = bulletText.split(/\s+(with|in)\s+/i)[0]?.trim() || bulletText;
                pushCurrent();
                current = { ...emptyProject, name: mainName, description: bulletText };
                pushCurrent();
                return;
            }

            pushCurrent();
            current = { ...emptyProject, name: bulletText };
            pushCurrent();
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
    const [selectedUpdateProjectIndex, setSelectedUpdateProjectIndex] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const readUploadedText = async (file) => {
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.txt')) {
            return file.text();
        }

        if (fileName.endsWith('.docx')) {
            const buffer = await file.arrayBuffer();
            return extractDocxText(buffer);
        }

        if (fileName.endsWith('.doc')) {
            throw new Error('DOC_LEGACY_UNSUPPORTED');
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
            if (error.message === 'DOC_LEGACY_UNSUPPORTED') {
                setErrorMessage('File .doc (Word cũ) chưa đọc tự động được. Vui lòng mở file và Save As sang .docx rồi upload lại.');
                setOldCvText('');
                setOldCvFileName(file.name);
                return;
            }

            if (error.message === 'DECOMPRESSION_UNSUPPORTED') {
                setErrorMessage('Trình duyệt hiện tại chưa hỗ trợ giải nén .docx tự động. Vui lòng dùng Chrome/Edge/Safari mới nhất.');
                return;
            }

            setErrorMessage('Không đọc được file CV cũ. Vui lòng kiểm tra file Word (.docx) và thử lại.');
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
            const parsedProjects = parseProjectsFromText(text);
            setUpdateProjects(parsedProjects);
            setSelectedUpdateProjectIndex(parsedProjects.length ? '0' : '');
        } catch (error) {
            if (error.message === 'DOC_LEGACY_UNSUPPORTED') {
                setErrorMessage('File .doc (Word cũ) chưa đọc tự động được. Vui lòng mở file và Save As sang .docx rồi upload lại.');
                setUpdateDocText('');
                setUpdateDocFileName(file.name);
                setUpdateProjects([]);
                setSelectedUpdateProjectIndex('');
                return;
            }

            if (error.message === 'DECOMPRESSION_UNSUPPORTED') {
                setErrorMessage('Trình duyệt hiện tại chưa hỗ trợ giải nén .docx tự động. Vui lòng dùng Chrome/Edge/Safari mới nhất.');
                return;
            }

            setErrorMessage('Không đọc được file cập nhật. Vui lòng kiểm tra file Word (.docx) và thử lại.');
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


    const selectedUpdateProject = useMemo(() => {
        if (selectedUpdateProjectIndex === '') return null;

        const index = Number(selectedUpdateProjectIndex);
        if (Number.isNaN(index) || index < 0 || index >= updateProjects.length) return null;

        return updateProjects[index];
    }, [selectedUpdateProjectIndex, updateProjects]);

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
                <h2 className="text-h3">Bước 1 - Upload file CV cũ (.docx/.txt)</h2>
                <input type="file" accept=".docx,.txt,.doc" onChange={onUploadOldCv} />
                <p className="text-muted">File đã chọn: {oldCvFileName || 'Chưa có file'}</p>
                <textarea
                    rows={8}
                    value={oldCvText}
                    onChange={(event) => setOldCvText(event.target.value)}
                    placeholder="Nội dung CV cũ sẽ hiển thị tại đây sau khi upload"
                />
            </section>

            <section className="card cv-card">
                <h2 className="text-h3">Bước 2 - Upload file thông tin cập nhật (.docx/.txt)</h2>
                <input type="file" accept=".docx,.txt,.doc" onChange={onUploadUpdateDoc} />
                <p className="text-muted">File đã chọn: {updateDocFileName || 'Chưa có file'}</p>
                <textarea
                    rows={6}
                    value={updateDocText}
                    onChange={(event) => setUpdateDocText(event.target.value)}
                    placeholder="Nội dung file cập nhật sẽ hiển thị tại đây sau khi upload"
                />

                {updateProjects.length > 0 && (
                    <div className="import-list compact-import">
                        <h3>Chọn nhanh dự án theo tên (từ file bước 2)</h3>
                        <div className="compact-import-row">
                            <select
                                value={selectedUpdateProjectIndex}
                                onChange={(event) => setSelectedUpdateProjectIndex(event.target.value)}
                            >
                                {updateProjects.map((project, index) => (
                                    <option key={`${project.name}-${index}`} value={String(index)}>
                                        {project.name || `Dự án ${index + 1}`}
                                    </option>
                                ))}
                            </select>

                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={() => selectedUpdateProject && importProjectFromStep2(selectedUpdateProject)}
                                disabled={!selectedUpdateProject}
                            >
                                Copy toàn bộ vào CV mới
                            </button>
                        </div>

                        {selectedUpdateProject && (
                            <div className="import-item">
                                <div>
                                    <strong>{selectedUpdateProject.name || 'Chưa có tên dự án'}</strong>
                                    <p className="text-muted">Quy mô: {selectedUpdateProject.scale || '...'}</p>
                                    <p className="text-muted">Vai trò: {selectedUpdateProject.role || '...'}</p>
                                    <p className="text-muted">Thời gian: {selectedUpdateProject.period || '...'}</p>
                                    <p className="text-muted">Mô tả: {selectedUpdateProject.description || '...'}</p>
                                    <p className="text-muted">Công nghệ/Công cụ: {selectedUpdateProject.tech || '...'}</p>
                                    <p className="text-muted">Kết quả: {selectedUpdateProject.result || '...'}</p>
                                </div>
                            </div>
                        )}
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
