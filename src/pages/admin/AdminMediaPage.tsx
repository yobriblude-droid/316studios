import React, { useState } from 'react';
import { AdminPageHeader } from '../../components/admin';
import { MediaFilePicker } from '../../components/admin/MediaFilePicker';

const AdminMediaPage = () => {
  const [subdir, setSubdir] = useState('general');
  const [selectedUrl, setSelectedUrl] = useState('');

  return (
    <>
      <AdminPageHeader
        title="Media library"
        description="All uploads are stored under media/ in the project root — organized by folder."
      />
      <MediaFilePicker
        subdir={subdir}
        onSubdirChange={setSubdir}
        selectedUrl={selectedUrl}
        onSelectUrl={setSelectedUrl}
        label={`Folder: media/${subdir}/`}
      />
      {selectedUrl && (
        <p className="mt-4 text-xs text-muted break-all">
          Selected URL: <span className="text-foreground">{selectedUrl}</span>
        </p>
      )}
    </>
  );
};

export default AdminMediaPage;
