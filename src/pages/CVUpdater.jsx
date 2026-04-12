import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import './CVUpdater.css';

const emptyProject = {
    name: '',
    role: '',
    period: '',
    description: '',
    tech: '',
    result: '',
};

const sampleTemplate = `Tên dự án: CRM nội bộ
Vai trò: Business Analyst
Thời gian: 01/2024 - 08/2024
Mô tả: Cải tiến quy trình xử lý yêu cầu khách hàng, phối hợp IT và vận hành.
Công nghệ/Công cụ: Jira, Figma, SQL cơ bản
Kết quả: Giảm 30% thời gian phản hồi.`;

const projectToText = (project, index) => {
    return `${index + 1}. ${project.name || 'Tên dự án'}\n- Vai trò: ${project.role || '...'}\n- Thời gian: ${project.period || '...'}\n- Mô tả: ${project.description || '...'}\n- Công nghệ/Công cụ: ${project.tech || '...'}\n- Kết quả nổi bật: ${project.result || '...'}\n`;
};

const CVUpdater = () => {
    const [fullName, setFullName] = useState('Nguyễn Văn A');
    const [position, setPosition] = useState('Chuyên viên Vận hành / PMO');
    const [summary, setSummary] = useState(
        'Nhân sự văn phòng có kinh nghiệm phối hợp liên phòng ban, tối ưu quy trình và theo dõi tiến độ dự án.',
    );
    const [oldCv, setOldCv] = useState('Dán nội dung CV cũ vào đây để tham chiếu khi cập nhật.');
    const [templateText, setTemplateText] = useState(sampleTemplate);
    const [projects, setProjects] = useState([{ ...emptyProject }]);

    const updateProject = (index, field, value) => {
        setProjects((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    const addProject = () => {
        setProjects((prev) => [...prev, { ...emptyProject }]);
    };

    const removeProject = (index) => {
        setProjects((prev) => prev.filter((_, i) => i !== index));
    };

    const generatedCv = useMemo(() => {
        const projectSection = projects.map((project, index) => projectToText(project, index)).join('\n');

        return `${fullName}\n${position}\n\nTÓM TẮT\n${summary}\n\nKINH NGHIỆM DỰ ÁN\n${projectSection}\n\nGHI CHÚ TỪ CV CŨ\n${oldCv}`;
    }, [fullName, position, summary, projects, oldCv]);

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
        link.download = `${fullName.replace(/\s+/g, '_') || 'cv_ca_nhan'}_updated.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            className="cv-updater-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <header className="cv-header">
                <h1 className="text-h1">Cập nhật CV cá nhân (đơn giản, dễ dùng)</h1>
                <p className="text-muted">
                    Quy trình 3 bước: nhập thông tin CV cũ → điền/sửa dự án → bấm xuất file Word.
                    Nếu bạn chạy local, mở app tại <strong>http://localhost:5173/cv-updater</strong>.
                </p>
            </header>

            <section className="card cv-card">
                <h2 className="text-h3">Bước 1 - Thông tin chung</h2>
                <div className="cv-grid">
                    <label>
                        Họ và tên
                        <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </label>
                    <label>
                        Vị trí công việc
                        <input value={position} onChange={(e) => setPosition(e.target.value)} />
                    </label>
                </div>
                <label>
                    Tóm tắt bản thân
                    <textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
                </label>
                <label>
                    Nội dung CV cũ (để tham chiếu)
                    <textarea rows={5} value={oldCv} onChange={(e) => setOldCv(e.target.value)} />
                </label>
            </section>

            <section className="card cv-card">
                <h2 className="text-h3">Bước 2 - Mẫu thông tin dự án để copy</h2>
                <p className="text-muted">
                    Bạn có thể dán mẫu chuẩn của công ty vào đây rồi copy từng phần khi điền dự án bên dưới.
                </p>
                <textarea rows={7} value={templateText} onChange={(e) => setTemplateText(e.target.value)} />
            </section>

            <section className="card cv-card">
                <div className="project-header-row">
                    <h2 className="text-h3">Bước 3 - Sửa dự án cũ và thêm dự án mới</h2>
                    <button type="button" className="btn btn-primary" onClick={addProject}>+ Thêm dự án</button>
                </div>

                {projects.map((project, index) => (
                    <div key={`project-${index}`} className="project-block">
                        <div className="project-title-row">
                            <h3>Dự án #{index + 1}</h3>
                            {projects.length > 1 && (
                                <button type="button" className="btn btn-ghost" onClick={() => removeProject(index)}>
                                    Xóa dự án này
                                </button>
                            )}
                        </div>
                        <div className="cv-grid">
                            <label>
                                Tên dự án
                                <input
                                    value={project.name}
                                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                                />
                            </label>
                            <label>
                                Vai trò
                                <input
                                    value={project.role}
                                    onChange={(e) => updateProject(index, 'role', e.target.value)}
                                />
                            </label>
                            <label>
                                Thời gian
                                <input
                                    value={project.period}
                                    onChange={(e) => updateProject(index, 'period', e.target.value)}
                                />
                            </label>
                            <label>
                                Công nghệ / Công cụ
                                <input
                                    value={project.tech}
                                    onChange={(e) => updateProject(index, 'tech', e.target.value)}
                                />
                            </label>
                        </div>
                        <label>
                            Mô tả công việc
                            <textarea
                                rows={3}
                                value={project.description}
                                onChange={(e) => updateProject(index, 'description', e.target.value)}
                            />
                        </label>
                        <label>
                            Kết quả nổi bật
                            <textarea
                                rows={2}
                                value={project.result}
                                onChange={(e) => updateProject(index, 'result', e.target.value)}
                            />
                        </label>
                    </div>
                ))}
            </section>

            <section className="card cv-card">
                <div className="preview-header-row">
                    <h2 className="text-h3">Xem trước CV sau cập nhật</h2>
                    <button type="button" className="btn btn-primary" onClick={downloadWord}>
                        Xuất ra Word (.doc)
                    </button>
                </div>
                <pre className="cv-preview">{generatedCv}</pre>
            </section>
        </motion.div>
    );
};

export default CVUpdater;
