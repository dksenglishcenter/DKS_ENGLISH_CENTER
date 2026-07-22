import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
  type ValidationPipeOptions,
} from '@nestjs/common';

/** Nhãn field dễ đọc — tránh hiện raw property name tiếng Anh. */
const FIELD_LABELS: Record<string, string> = {
  fullName: 'Họ và tên',
  email: 'Email',
  phone: 'Số điện thoại',
  password: 'Mật khẩu',
  rememberMe: 'Ghi nhớ đăng nhập',
  token: 'Mã xác nhận',
  jobId: 'Vị trí tuyển dụng',
  position: 'Vị trí',
  introduction: 'Giới thiệu',
  courseInterest: 'Khóa học quan tâm',
  learningNeeds: 'Nhu cầu học',
  title: 'Tiêu đề',
  slug: 'Đường dẫn (slug)',
  subtitle: 'Phụ đề',
  description: 'Mô tả',
  level: 'Trình độ',
  target: 'Mục tiêu',
  tuition: 'Học phí',
  duration: 'Thời lượng',
  perks: 'Điểm nổi bật',
  category: 'Danh mục',
  coverImageUrl: 'Ảnh bìa',
  imageUrl: 'Ảnh',
  visionImageUrl: 'Ảnh tầm nhìn',
  accent: 'Màu nhấn',
  bg: 'Màu nền',
  icon: 'Biểu tượng',
  featured: 'Nổi bật',
  sortOrder: 'Thứ tự hiển thị',
  isPublished: 'Trạng thái hiển thị',
  publishedOnly: 'Chỉ bài đã xuất bản',
  page: 'Trang',
  pageSize: 'Số dòng mỗi trang',
  q: 'Từ khóa tìm kiếm',
  search: 'Từ khóa tìm kiếm',
  type: 'Loại hình',
  location: 'Địa điểm',
  salaryType: 'Loại lương',
  salaryMin: 'Lương tối thiểu',
  salaryMax: 'Lương tối đa',
  currency: 'Đơn vị tiền',
  duties: 'Nhiệm vụ',
  benefits: 'Quyền lợi',
  req: 'Yêu cầu',
  address: 'Địa chỉ',
  hours: 'Giờ làm việc',
  mapUrl: 'Link Google Maps',
  role: 'Quyền tài khoản',
  name: 'Tên',
  quote: 'Trích dẫn',
  course: 'Khóa học',
  rating: 'Đánh giá',
  emoji: 'Biểu tượng',
  alt: 'Mô tả ảnh',
  objectPosition: 'Vị trí ảnh',
  bio: 'Tiểu sử',
  specialty: 'Chuyên môn',
  experience: 'Kinh nghiệm',
  file: 'Tệp',
  url: 'Đường dẫn',
  publicId: 'Mã ảnh',
  stashPublicId: 'Mã ảnh tạm',
  originalPublicId: 'Mã ảnh gốc',
  author: 'Tác giả',
  excerpt: 'Tóm tắt',
  content: 'Nội dung',
  sections: 'Các phần nội dung',
  readTime: 'Thời gian đọc',
  linkHref: 'Đường dẫn liên kết',
  linkLabel: 'Nhãn liên kết',
  id: 'Mã',
};

function labelOf(property: string): string {
  const leaf = property.includes('.')
    ? property.slice(property.lastIndexOf('.') + 1)
    : property;
  // sections.0.title → title
  const cleaned = leaf.replace(/^\d+$/, '') || leaf;
  const key = cleaned || leaf;
  return FIELD_LABELS[key] ?? FIELD_LABELS[property] ?? property;
}

function hasVietnamese(text: string): boolean {
  return /[À-ỹĂăÂâÊêÔôƠơƯưĐđ]/.test(text);
}

/** Message mặc định class-validator (EN) → tiếng Việt theo loại constraint. */
function translateConstraint(
  type: string,
  propertyPath: string,
  original: string,
): string {
  if (hasVietnamese(original)) {
    return original;
  }

  const field = labelOf(propertyPath);

  switch (type) {
    case 'isEmail':
      return `${field} không đúng định dạng email.`;
    case 'isString':
      return `${field} phải là chuỗi ký tự.`;
    case 'isNotEmpty':
      return `Vui lòng nhập ${field.toLowerCase()}.`;
    case 'isBoolean':
      return `${field} không hợp lệ.`;
    case 'isInt':
    case 'isNumber':
      return `${field} phải là số nguyên.`;
    case 'isArray':
      return `${field} phải là danh sách.`;
    case 'isUrl':
      return `${field} phải là URL https hợp lệ.`;
    case 'isEnum':
    case 'isIn':
      return `${field} không nằm trong giá trị cho phép.`;
    case 'minLength': {
      const m =
        original.match(/longer than or equal to (\d+)/i) ??
        original.match(/at least (\d+)/i) ??
        original.match(/(\d+)/);
      return m
        ? `${field} phải có ít nhất ${m[1]} ký tự.`
        : `${field} quá ngắn.`;
    }
    case 'maxLength': {
      const m =
        original.match(/shorter than or equal to (\d+)/i) ??
        original.match(/at most (\d+)/i) ??
        original.match(/(\d+)/);
      return m
        ? `${field} không được vượt quá ${m[1]} ký tự.`
        : `${field} quá dài.`;
    }
    case 'min': {
      const m = original.match(/(\d+)/);
      return m
        ? `${field} phải lớn hơn hoặc bằng ${m[1]}.`
        : `${field} quá nhỏ.`;
    }
    case 'max': {
      const m = original.match(/(\d+)/);
      return m
        ? `${field} phải nhỏ hơn hoặc bằng ${m[1]}.`
        : `${field} quá lớn.`;
    }
    case 'arrayMinSize': {
      const m = original.match(/(\d+)/);
      return m
        ? `${field} cần ít nhất ${m[1]} mục.`
        : `${field} còn thiếu mục.`;
    }
    case 'arrayMaxSize': {
      const m = original.match(/(\d+)/);
      return m
        ? `${field} không được vượt quá ${m[1]} mục.`
        : `${field} quá nhiều mục.`;
    }
    case 'arrayUnique':
      return `${field} không được trùng lặp.`;
    case 'matches':
      return `${field} không đúng định dạng.`;
    case 'isGoogleMapsShareUrl':
      return original; // constraint đã có defaultMessage tiếng Việt
    case 'whitelistValidation':
      return `Trường không được phép: ${field}.`;
    default:
      // Còn sót EN → generic VN, không lộ raw English
      return `${field} không hợp lệ.`;
  }
}

function flattenErrors(
  errors: ValidationError[],
  parentPath = '',
): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      for (const [type, message] of Object.entries(error.constraints)) {
        messages.push(translateConstraint(type, path, message));
      }
    }

    if (error.children?.length) {
      messages.push(...flattenErrors(error.children, path));
    }
  }

  return messages;
}

export function createVietnameseValidationPipe(
  options: ValidationPipeOptions = {},
): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    ...options,
    exceptionFactory: (errors: ValidationError[]) => {
      const messages = flattenErrors(errors);
      return new BadRequestException(
        messages.length > 0 ? messages : ['Dữ liệu gửi lên không hợp lệ.'],
      );
    },
  });
}
