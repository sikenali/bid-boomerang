import {
  RiDownloadCloudLine,
  RiQuillPenLine,
  RiTodoLine,
  RiLayoutColumnLine,
  RiBookOpenLine,
  RiPriceTagLine,
} from '@remixicon/vue';

export const TOOL_ICON_MAP = {
  'ri-download-cloud-line': RiDownloadCloudLine,
  'ri-quill-pen-line': RiQuillPenLine,
  'ri-todo-line': RiTodoLine,
  'ri-layout-column-line': RiLayoutColumnLine,
  'ri-book-open-line': RiBookOpenLine,
  'ri-price-tag-line': RiPriceTagLine,
};

export function toolIconComponent(iconClass) {
  return TOOL_ICON_MAP[iconClass] || RiQuillPenLine;
}
