/** Endpoint admin tải CV — backend gắn đúng tên file gốc. */
export function getCareerCvAdminDownloadPath(applicationId: string): string {
  return `/api/careers/applications/${applicationId}/cv`;
}
