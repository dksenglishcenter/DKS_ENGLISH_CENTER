import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AttendanceStatus,
  ClassStatus,
  InvoiceStatus,
  PrismaClient,
  Role,
  StudentStatus,
} from '../generated/prisma/client';

const ADMIN_SEED = {
  email: 'admin@dks.vn',
  password: 'Admin@123456',
  fullName: 'DKS Admin',
} as const;

function unsplashCover(imgId: string) {
  return `https://images.unsplash.com/photo-${imgId}?w=800&h=600&fit=crop&auto=format`;
}

const COURSES_SEED = [
  {
    slug: 'grade-10',
    category: 'grade-10',
    title: 'Luyện Thi Vào Lớp 10',
    subtitle: 'Ôn thi lớp 9 lên lớp 10 THPT',
    level: 'Học sinh lớp 9',
    target: 'Kỳ thi tuyển sinh lớp 10',
    tuition: '120.000 ₫/buổi',
    duration: '90 phút/buổi',
    coverImageUrl: unsplashCover('1523240795612-9a054b0db644'),
    accent: '#FFA200',
    bg: '#FFFBF0',
    icon: '🥇',
    description:
      'Chương trình hệ thống kiến thức, củng cố ngữ pháp, mở rộng từ vựng và rèn kỹ năng làm bài thi vào lớp 10.',
    perks: [
      'Bám sát chương trình Bộ Giáo dục',
      'Lớp sĩ số nhỏ, theo sát học sinh',
      'Luyện đề và chữa bài chi tiết',
      'Xây dựng lộ trình ôn tập hiệu quả',
    ],
    featured: true,
    sortOrder: 0,
    isPublished: true,
  },
  {
    slug: 'thpt-university',
    category: 'thpt-university',
    title: 'Luyện Thi Đại Học & THPT',
    subtitle: 'Ôn thi tốt nghiệp và xét tuyển Đại học',
    level: 'Học sinh lớp 12',
    target: 'Tốt nghiệp THPT · Đại học',
    tuition: '150.000 ₫/buổi',
    duration: '120 phút/buổi',
    coverImageUrl: unsplashCover('1522202176988-66273c2fd55f'),
    accent: '#C0470F',
    bg: '#FFF7F3',
    icon: '🎓',
    description:
      'Khóa học củng cố kiến thức, luyện đề chuyên sâu và rèn chiến lược làm bài cho kỳ thi tốt nghiệp THPT và xét tuyển Đại học.',
    perks: [
      'Bám sát cấu trúc đề thi Bộ Giáo dục',
      'Giáo viên giàu kinh nghiệm luyện thi',
      'Lớp sĩ số nhỏ',
      'Lộ trình ôn tập khoa học',
    ],
    featured: true,
    sortOrder: 1,
    isPublished: true,
  },
  {
    slug: 'ielts',
    category: 'ielts',
    title: 'IELTS 1-1',
    subtitle: 'Luyện thi IELTS đảm bảo đầu ra',
    level: 'A1 – C1',
    target: 'IELTS 5.0 – 7.0+',
    tuition: '300.000 – 500.000 ₫/buổi',
    duration: '120 phút/buổi',
    coverImageUrl: unsplashCover('1434030216411-0b793f4b4173'),
    accent: '#F16522',
    bg: '#FFF4EC',
    icon: '🎯',
    description:
      'Khóa học 1 kèm 1 được thiết kế riêng theo trình độ, mục tiêu điểm số và tiến độ của từng học viên.',
    perks: [
      'Lộ trình cá nhân hóa sau kiểm tra đầu vào',
      '120 phút/buổi, 2–3 buổi/tuần',
      'Thi thử và báo cáo tiến độ định kỳ',
      'Cam kết đầu ra theo lộ trình',
    ],
    featured: true,
    sortOrder: 2,
    isPublished: true,
  },
  {
    slug: 'global-success',
    category: 'global-success',
    title: 'Global Success Lớp 1–9',
    subtitle: 'Tiếng Anh theo chương trình Bộ Giáo dục',
    level: 'Lớp 1–9 · Pre-A1 – B1+',
    target: 'Phát triển toàn diện 4 kỹ năng',
    tuition: 'Liên hệ tư vấn',
    duration: 'Theo khối lớp',
    coverImageUrl: unsplashCover('1529400971008-f566de0e6dfc'),
    accent: '#E95E1F',
    bg: '#FFF0EB',
    icon: '📚',
    description:
      'Chương trình tiếng Anh từ lớp 1 đến lớp 9, phát triển theo lộ trình CEFR và bám sát bộ sách Global Success.',
    perks: [
      'Bao phủ lộ trình từ lớp 1 đến lớp 9',
      'Phát triển Nghe · Nói · Đọc · Viết',
      'Đánh giá học thuật định kỳ',
      'Nền tảng cho kỳ thi vào lớp 10',
    ],
    featured: true,
    sortOrder: 3,
    isPublished: true,
  },
];

const SUCCESS_STORIES_SEED = [
  {
    name: 'Nguyễn Thị Mai',
    course: 'IELTS Preparation',
    badge: 'IELTS 7.0 ↑ từ 5.0',
    text: 'Sau 6 tháng học tại DKS, điểm IELTS của tôi từ 5.0 đã lên 7.0. Giáo viên rất tận tâm và phương pháp dạy hiệu quả. Các buổi mock test giúp tôi quen áp lực thi thật rất nhiều.',
    stars: 5,
    avatar: 'MT',
    sortOrder: 0,
    isPublished: true,
  },
  {
    name: 'Trần Văn Hùng',
    course: '9-to-10 Prep',
    badge: '9.5 điểm vào 10 chuyên',
    text: 'DKS đã giúp con trai tôi đạt 9.5 điểm thi vào lớp 10 chuyên. Giáo viên không chỉ dạy kiến thức mà còn truyền cảm hứng học tập. Rất biết ơn trung tâm!',
    stars: 5,
    avatar: 'HT',
    sortOrder: 1,
    isPublished: true,
  },
  {
    name: 'Phạm Thị Linh',
    course: 'Communicative English',
    badge: 'Tự tin giao tiếp công việc',
    text: 'Tôi đã từng rất sợ nói tiếng Anh nhưng sau 3 tháng tại DKS, tôi có thể tự tin trình bày trước khách hàng nước ngoài. Lớp nhỏ giúp tôi được thực hành nhiều hơn.',
    stars: 5,
    avatar: 'LP',
    sortOrder: 2,
    isPublished: true,
  },
];

const GALLERY_SEED = [
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1783957854/dks-english-center/home/gallery/lvfjmykrqsfyx2twa6ix.jpg',
    alt: 'Giáo viên nước ngoài hướng dẫn học sinh trong lớp tại DKS',
    objectPosition: 'center',
    sortOrder: 0,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1783958170/dks-english-center/home/gallery/cbckli4qkzk0lfebk0yn.jpg',
    alt: 'Giáo viên và học viên trong lớp luyện nói IELTS tại DKS',
    objectPosition: 'center 62%',
    sortOrder: 1,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1783958210/dks-english-center/home/gallery/jusxkuz4es9b14uezyyc.jpg',
    alt: 'Buổi học kèm tiếng Anh theo nhóm nhỏ tại DKS',
    objectPosition: 'center 65%',
    sortOrder: 2,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1783957984/dks-english-center/home/gallery/vxkeeeeonutskpdj3co1.jpg',
    alt: 'Giáo viên và học sinh tham gia hoạt động tiếng Anh tại DKS',
    objectPosition: 'center 66%',
    sortOrder: 3,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1783958142/dks-english-center/home/gallery/gsaq92tofolpc5lhruww.jpg',
    alt: 'Học sinh hào hứng sau hoạt động tiếng Anh cùng giáo viên tại DKS',
    objectPosition: 'center 64%',
    sortOrder: 4,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1783958258/dks-english-center/home/gallery/tw7sbyrzuzukmye4tqqv.jpg',
    alt: 'Giáo viên theo sát học sinh trong giờ thực hành tại DKS',
    objectPosition: 'center 65%',
    sortOrder: 5,
    isPublished: true,
  },
];

const VISION_IMAGE_SEED =
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=800&fit=crop&auto=format';

const FACILITIES_SEED = [
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1784020315/dks-english-center/about/facilities/imfrxincq533ykg5jdmc.jpg',
    title: 'Phòng học tiêu chuẩn',
    sortOrder: 0,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1784020413/dks-english-center/about/facilities/fyvn6ekkalj1oseb75ns.jpg',
    title: 'Phòng học trang bị màn hình',
    sortOrder: 1,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1784020448/dks-english-center/about/facilities/cpypxhzpasixzeut7dit.jpg',
    title: 'Không gian sinh hoạt chung',
    sortOrder: 2,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1784020477/dks-english-center/about/facilities/fjqblom7jhl2hluwlrxv.jpg',
    title: 'Khu vực lễ tân DKS',
    sortOrder: 3,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1784020589/dks-english-center/about/facilities/qv93fme2iiasoqoc07mn.jpg',
    title: 'Hoạt động học tập tại trung tâm',
    sortOrder: 4,
    isPublished: true,
  },
  {
    imageUrl:
      'https://res.cloudinary.com/hw92uddx/image/upload/v1784020643/dks-english-center/about/facilities/woyt47e6coy4ji9sq8pr.jpg',
    title: 'Lớp học thiếu nhi',
    sortOrder: 5,
    isPublished: true,
  },
];

function unsplashTeacher(imgId: string) {
  return `https://images.unsplash.com/photo-${imgId}?w=600&h=700&fit=crop&auto=format`;
}

const TEACHERS_SEED = [
  {
    name: 'Mr. Youssef Lamine',
    title: 'ESL & IELTS Teacher',
    cred: 'M.A. TEFL · TESOL 120H',
    exp: '8 năm kinh nghiệm',
    imageUrl: unsplashTeacher('1573496359142-b8d87734a5a2'),
    bio: 'Thạc sĩ chuyên ngành giảng dạy tiếng Anh, có kinh nghiệm đào tạo giao tiếp và IELTS cho học viên từ mầm non đến THPT.',
    sortOrder: 0,
    isPublished: true,
  },
  {
    name: 'Mr. Mo',
    title: 'English Language Teacher',
    cred: 'Cử nhân · C1 · TESOL',
    exp: '5 năm kinh nghiệm',
    imageUrl: unsplashTeacher('1568602471122-7832951cc4c5'),
    bio: 'Sở hữu chứng chỉ tiếng Anh C1 và TESOL. Thầy chú trọng phương pháp giảng dạy dễ hiểu, hiệu quả và phù hợp với từng học viên.',
    sortOrder: 1,
    isPublished: true,
  },
  {
    name: 'Mr. Phan Duy Đức',
    title: 'TOEIC & Academic English',
    cred: 'TOEIC 880 · Tiếng Anh THPT 9.4',
    exp: '7 năm kinh nghiệm',
    imageUrl: unsplashTeacher('1607746882042-944635dfe10e'),
    bio: 'Có kinh nghiệm luyện thi B1, TOEIC và tiếng Anh THPT. Thầy xây dựng lộ trình học rõ ràng theo năng lực và mục tiêu cá nhân.',
    sortOrder: 2,
    isPublished: true,
  },
  {
    name: 'Mr. Huỳnh Tấn Sang',
    title: 'English & SAT Tutor',
    cred: 'IELTS 7.5 · SAT 1540',
    exp: '3 năm kinh nghiệm',
    imageUrl: unsplashTeacher('1500648767791-00dcc994a43e'),
    bio: 'Sở hữu IELTS 7.5 và SAT 1540, có kinh nghiệm giảng dạy học sinh lớp 5–9 với phương pháp truyền đạt logic, có hệ thống.',
    sortOrder: 3,
    isPublished: true,
  },
];

const DEFAULT_BLOG_SECTIONS = [
  {
    heading: 'Đặt mục tiêu rõ ràng',
    body: 'Trước khi bắt đầu học, hãy xác định mục tiêu cụ thể: thi IELTS đạt 7.0, giao tiếp tự tin với khách hàng nước ngoài, hay vào được trường đại học mong muốn. Mục tiêu rõ ràng giúp bạn chọn đúng lộ trình và duy trì động lực.',
  },
  {
    heading: 'Phương pháp học hiệu quả',
    body: 'Học theo phương pháp spaced repetition – ôn tập đúng thời điểm trước khi quên. Kết hợp nhiều kỹ năng trong một buổi học thay vì tách riêng lẻ. Luyện nghe, nói, đọc, viết song song để tiến bộ toàn diện.',
  },
  {
    heading: 'Tạo môi trường tiếng Anh',
    body: 'Bao quanh mình bằng tiếng Anh: đổi ngôn ngữ điện thoại, xem phim với phụ đề tiếng Anh, nghe podcast khi di chuyển. Immersion là cách học tự nhiên và bền vững nhất.',
  },
  {
    heading: 'Không sợ mắc lỗi',
    body: 'Người học tiến bộ nhanh nhất không phải người ít mắc lỗi nhất, mà là người dám thực hành nhiều nhất. Hãy coi lỗi sai là bước đệm để tiến bộ, không phải rào cản.',
  },
];

const DEFAULT_BLOG_INTRO =
  'Tiếng Anh là chìa khóa mở ra cơ hội trong thế giới hội nhập. Bài viết này chia sẻ những kiến thức và kinh nghiệm thực tiễn từ đội ngũ giáo viên DKS English Center.';

const BLOG_POSTS_SEED = [
  {
    slug: '5-bi-quyet-ielts-writing-band-7',
    title: '5 Bí Quyết Học IELTS Writing Đạt Band 7.0+',
    excerpt:
      'Writing là kỹ năng nhiều thí sinh gặp khó khăn nhất. Bài viết chia sẻ 5 chiến lược giúp bạn cải thiện Writing một cách hệ thống.',
    category: 'IELTS Tips',
    publishedAt: new Date('2025-06-15'),
    readTimeMinutes: 8,
    coverImageUrl: unsplashCover('1481627834876-b7833e8f5570'),
    featured: true,
    intro:
      'Writing là kỹ năng nhiều thí sinh gặp khó khăn nhất trong kỳ thi IELTS. Tuy nhiên, với phương pháp đúng đắn và luyện tập kiên trì, bạn hoàn toàn có thể đạt band 7.0 trở lên.',
    sections: [
      {
        heading: '1. Nắm vững cấu trúc bài thi',
        body: 'Task 1 yêu cầu mô tả dữ liệu từ biểu đồ (150 từ, 20 phút). Task 2 là dạng essay học thuật (250 từ, 40 phút). Hiểu rõ yêu cầu từng Task giúp bạn phân bổ thời gian và chiến lược làm bài hợp lý.',
      },
      {
        heading: '2. Luyện tập viết hàng ngày',
        body: '30 phút viết mỗi ngày hiệu quả hơn 3 tiếng vào cuối tuần. Bắt đầu bằng việc phân tích bài mẫu band 8.0+, học cấu trúc câu và cách triển khai luận điểm, sau đó tự viết lại theo ngôn ngữ của bạn.',
      },
      {
        heading: '3. Xây dựng vốn từ học thuật',
        body: 'Tập trung vào Academic Word List (AWL) — 570 từ học thuật phổ biến nhất trong bài thi IELTS. Học theo nhóm chủ đề: Environment, Technology, Education, Health. Tránh lặp từ và dùng từ quá đơn giản.',
      },
      {
        heading: '4. Chú trọng Coherence & Cohesion',
        body: 'Dùng linking words đúng chỗ: Furthermore, However, In contrast, As a result, Nevertheless. Mỗi đoạn thân bài cần có topic sentence rõ ràng, supporting ideas và ví dụ cụ thể.',
      },
      {
        heading: '5. Luyện thi theo thời gian thực',
        body: 'Đặt đồng hồ 60 phút và hoàn thành cả 2 Tasks. Sau đó tự đánh giá theo 4 tiêu chí: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.',
      },
    ],
    takeaway:
      'Luyện tập đều đặn, hiểu tiêu chí chấm và luôn tự đánh giá sau mỗi bài viết là nền tảng để tiến tới band 7.0+.',
    isPublished: true,
    sortOrder: 0,
  },
  {
    slug: 'phat-am-tieng-anh-chuan-trong-30-ngay',
    title: 'Cách Phát Âm Tiếng Anh Chuẩn Trong 30 Ngày',
    excerpt:
      'Phát âm chuẩn là nền tảng của tiếng Anh tự tin. Kế hoạch 30 ngày này sẽ giúp bạn cải thiện pronunciation một cách bài bản.',
    category: 'Học Tiếng Anh',
    publishedAt: new Date('2025-06-10'),
    readTimeMinutes: 6,
    coverImageUrl: unsplashCover('1434030216411-0b793f4b4173'),
    featured: true,
    intro:
      'Phát âm chuẩn là nền tảng để học tiếng Anh tự tin. Nhiều người học tiếng Anh nhiều năm nhưng vẫn phát âm sai vì thiếu phương pháp hệ thống. Kế hoạch 30 ngày dưới đây sẽ giúp bạn cải thiện đáng kể.',
    sections: [
      {
        heading: 'Tuần 1: Nền tảng âm vị học',
        body: 'Học 44 âm vị tiếng Anh (phonemes). Tập trung vào các âm không có trong tiếng Việt như /θ/, /ð/, /æ/, /ʌ/, /ɪ/ và nghe phát âm chuẩn trước khi lặp lại.',
      },
      {
        heading: 'Tuần 2: Nguyên âm & Phụ âm',
        body: 'Luyện từng cặp nguyên âm dễ nhầm: /ɪ/ và /iː/, /ʊ/ và /uː/. Ghi âm và nghe lại giọng mình mỗi ngày để nhận ra lỗi sai.',
      },
      {
        heading: 'Tuần 3: Trọng âm từ và câu',
        body: 'Trọng âm từ ảnh hưởng lớn đến khả năng hiểu của người nghe. Luyện tập với các từ thường gặp và đánh dấu trọng âm trước khi đọc thành tiếng.',
      },
      {
        heading: 'Tuần 4: Ngữ điệu tự nhiên',
        body: 'Luyện connected speech bằng phương pháp shadowing với nội dung từ người bản ngữ. Chọn một giọng Anh hoặc Mỹ và duy trì nhất quán.',
      },
    ],
    takeaway:
      'Ba mươi ngày không biến bạn thành người bản ngữ, nhưng đủ để tạo thói quen nghe, ghi âm và sửa lỗi phát âm có hệ thống.',
    isPublished: true,
    sortOrder: 1,
  },
  {
    slug: 'top-10-ung-dung-hoc-tieng-anh-2025',
    title: 'Top 10 Ứng Dụng Học Tiếng Anh Hiệu Quả 2025',
    excerpt:
      'Công nghệ AI đang thay đổi cách chúng ta học ngoại ngữ. Điểm qua 10 ứng dụng tốt nhất giúp bạn luyện tập mọi lúc mọi nơi.',
    category: 'Công Nghệ',
    publishedAt: new Date('2025-06-05'),
    readTimeMinutes: 5,
    coverImageUrl: unsplashCover('1522202176988-66273c2fd55f'),
    featured: false,
    intro: DEFAULT_BLOG_INTRO,
    sections: DEFAULT_BLOG_SECTIONS,
    takeaway:
      'Ứng dụng chỉ phát huy hiệu quả khi phục vụ một mục tiêu học rõ ràng và được sử dụng đều đặn.',
    isPublished: true,
    sortOrder: 2,
  },
  {
    slug: 'chien-luoc-luyen-thi-tieng-anh-vao-lop-10',
    title: 'Chiến Lược Luyện Thi Tiếng Anh Vào Lớp 10 Hiệu Quả',
    excerpt:
      'Kỳ thi vào lớp 10 có thể chinh phục nếu bạn có chiến lược đúng. Bài viết hướng dẫn từng bước chuẩn bị chi tiết.',
    category: 'Thi Cử',
    publishedAt: new Date('2025-06-01'),
    readTimeMinutes: 10,
    coverImageUrl: unsplashCover('1580582932707-520aed937b7b'),
    featured: false,
    intro: DEFAULT_BLOG_INTRO,
    sections: DEFAULT_BLOG_SECTIONS,
    takeaway:
      'Một kế hoạch ôn tập theo giai đoạn giúp bạn bám sát mục tiêu và giảm áp lực trước ngày thi.',
    isPublished: true,
    sortOrder: 3,
  },
  {
    slug: 'loi-ngu-phap-nguoi-viet-hay-mac',
    title: 'Lỗi Ngữ Pháp Người Việt Hay Mắc Khi Học Tiếng Anh',
    excerpt:
      'Phân tích những lỗi ngữ pháp phổ biến và đưa ra cách khắc phục hiệu quả cho người học tiếng Anh tại Việt Nam.',
    category: 'Ngữ Pháp',
    publishedAt: new Date('2025-05-25'),
    readTimeMinutes: 7,
    coverImageUrl: unsplashCover('1529400971008-f566de0e6dfc'),
    featured: false,
    intro: DEFAULT_BLOG_INTRO,
    sections: DEFAULT_BLOG_SECTIONS,
    takeaway:
      'Ghi lại lỗi sai theo nhóm và chủ động dùng lại cấu trúc đúng sẽ giúp bạn tiến bộ bền vững hơn.',
    isPublished: true,
    sortOrder: 4,
  },
  {
    slug: 'hoc-tieng-anh-cung-con-tu-3-tuoi',
    title: 'Học Tiếng Anh Cùng Con Từ 3 Tuổi: Nên Hay Không?',
    excerpt:
      'Độ tuổi nào phù hợp để bắt đầu học tiếng Anh? Chuyên gia giải đáp và đưa phương pháp tiếp cận phù hợp từng độ tuổi.',
    category: 'Phụ Huynh',
    publishedAt: new Date('2025-05-20'),
    readTimeMinutes: 9,
    coverImageUrl: unsplashCover('1580582932707-520aed937b7b'),
    featured: false,
    intro: DEFAULT_BLOG_INTRO,
    sections: DEFAULT_BLOG_SECTIONS,
    takeaway:
      'Ở tuổi nhỏ, sự hứng thú và môi trường tiếp xúc tự nhiên quan trọng hơn khối lượng kiến thức.',
    isPublished: true,
    sortOrder: 5,
  },
];

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(ADMIN_SEED.password, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_SEED.email },
    update: {
      passwordHash,
      fullName: ADMIN_SEED.fullName,
      role: Role.ADMIN,
    },
    create: {
      email: ADMIN_SEED.email,
      passwordHash,
      fullName: ADMIN_SEED.fullName,
      role: Role.ADMIN,
    },
    select: { id: true, email: true, role: true, fullName: true },
  });

  console.log('Admin seed OK:', admin);
  console.log(`Login: ${ADMIN_SEED.email} / ${ADMIN_SEED.password}`);

  for (const course of COURSES_SEED) {
    const data = {
      ...course,
      perks: [...course.perks],
    };
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: data,
      create: data,
    });
  }

  console.log(`Courses seed OK: ${COURSES_SEED.length} khóa`);

  const existingStories = await prisma.successStory.count();
  if (existingStories === 0) {
    await prisma.successStory.createMany({
      data: SUCCESS_STORIES_SEED.map((story) => ({ ...story })),
    });
    console.log(`Success stories seed OK: ${SUCCESS_STORIES_SEED.length}`);
  } else {
    console.log(`Success stories seed skipped (${existingStories} đã có)`);
  }

  const existingGallery = await prisma.galleryImage.count();
  if (existingGallery === 0) {
    await prisma.galleryImage.createMany({
      data: GALLERY_SEED.map((image) => ({ ...image })),
    });
    console.log(`Gallery images seed OK: ${GALLERY_SEED.length}`);
  } else {
    console.log(`Gallery images seed skipped (${existingGallery} đã có)`);
  }

  await prisma.aboutPageContent.upsert({
    where: { id: 'about' },
    create: {
      id: 'about',
      visionImageUrl: VISION_IMAGE_SEED,
    },
    update: {},
  });
  console.log('About content seed OK');

  const existingFacilities = await prisma.facilityImage.count();
  if (existingFacilities === 0) {
    await prisma.facilityImage.createMany({
      data: FACILITIES_SEED.map((item) => ({ ...item })),
    });
    console.log(`Facility images seed OK: ${FACILITIES_SEED.length}`);
  } else {
    console.log(`Facility images seed skipped (${existingFacilities} đã có)`);
  }

  const existingTeachers = await prisma.teacher.count();
  if (existingTeachers === 0) {
    await prisma.teacher.createMany({
      data: TEACHERS_SEED.map((item) => ({ ...item })),
    });
    console.log(`Teachers seed OK: ${TEACHERS_SEED.length}`);
  } else {
    console.log(`Teachers seed skipped (${existingTeachers} đã có)`);
  }

  for (const post of BLOG_POSTS_SEED) {
    const data = {
      ...post,
      sections: post.sections.map((section) => ({ ...section })),
    };
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: data,
      create: data,
    });
  }
  console.log(`Blog posts seed OK: ${BLOG_POSTS_SEED.length} bài`);

  await seedPhase3Ops(prisma);

  await prisma.$disconnect();
}

async function seedPhase3Ops(prisma: PrismaClient) {
  const teacherHash = await bcrypt.hash('Teacher@123456', 12);
  const parentHash = await bcrypt.hash('Parent@123456', 12);

  const teacherA = await prisma.user.upsert({
    where: { email: 'gv.a@dks.vn' },
    update: { passwordHash: teacherHash, fullName: 'Giáo viên A', role: Role.TEACHER },
    create: {
      email: 'gv.a@dks.vn',
      passwordHash: teacherHash,
      fullName: 'Giáo viên A',
      role: Role.TEACHER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'gv.b@dks.vn' },
    update: { passwordHash: teacherHash, fullName: 'Giáo viên B', role: Role.TEACHER },
    create: {
      email: 'gv.b@dks.vn',
      passwordHash: teacherHash,
      fullName: 'Giáo viên B',
      role: Role.TEACHER,
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: 'ph.mai@dks.vn' },
    update: {
      passwordHash: parentHash,
      fullName: 'Phụ huynh Mai',
      role: Role.PARENT,
      phone: '0901234567',
    },
    create: {
      email: 'ph.mai@dks.vn',
      passwordHash: parentHash,
      fullName: 'Phụ huynh Mai',
      phone: '0901234567',
      role: Role.PARENT,
    },
  });

  const studentAn = await prisma.student.upsert({
    where: { id: 'cphase3studentan000000001' },
    update: {},
    create: {
      id: 'cphase3studentan000000001',
      fullName: 'Nguyễn An',
      phone: '0911111111',
      email: 'an.nguyen@student.dks.vn',
      parentName: 'Phụ huynh Mai',
      parentPhone: '0901234567',
      status: StudentStatus.STUDYING,
    },
  });

  const studentBinh = await prisma.student.upsert({
    where: { id: 'cphase3studentbinh0000001' },
    update: {},
    create: {
      id: 'cphase3studentbinh0000001',
      fullName: 'Trần Bình',
      phone: '0922222222',
      email: 'binh.tran@student.dks.vn',
      parentName: 'Phụ huynh Mai',
      parentPhone: '0901234567',
      status: StudentStatus.STUDYING,
    },
  });

  await prisma.studentParent.upsert({
    where: {
      parentUserId_studentId: {
        parentUserId: parent.id,
        studentId: studentAn.id,
      },
    },
    update: {},
    create: { parentUserId: parent.id, studentId: studentAn.id },
  });

  await prisma.studentParent.upsert({
    where: {
      parentUserId_studentId: {
        parentUserId: parent.id,
        studentId: studentBinh.id,
      },
    },
    update: {},
    create: { parentUserId: parent.id, studentId: studentBinh.id },
  });

  const classGroup = await prisma.classGroup.upsert({
    where: { id: 'cphase3classgroup00000001' },
    update: { teacherId: teacherA.id, status: ClassStatus.OPEN },
    create: {
      id: 'cphase3classgroup00000001',
      name: 'Lớp A — Giao tiếp tối T2/T5',
      teacherId: teacherA.id,
      scheduleDays: [1, 4],
      startTime: '18:00',
      endTime: '19:30',
      room: 'P201',
      capacity: 12,
      status: ClassStatus.OPEN,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_classId: { studentId: studentAn.id, classId: classGroup.id },
    },
    update: { leftAt: null },
    create: { studentId: studentAn.id, classId: classGroup.id },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_classId: { studentId: studentBinh.id, classId: classGroup.id },
    },
    update: { leftAt: null },
    create: { studentId: studentBinh.id, classId: classGroup.id },
  });

  const day1 = new Date('2026-08-10T00:00:00.000Z');
  const day2 = new Date('2026-08-13T00:00:00.000Z');

  const session1 = await prisma.classSession.upsert({
    where: { classId_date: { classId: classGroup.id, date: day1 } },
    update: {},
    create: { classId: classGroup.id, date: day1 },
  });

  const session2 = await prisma.classSession.upsert({
    where: { classId_date: { classId: classGroup.id, date: day2 } },
    update: {},
    create: { classId: classGroup.id, date: day2 },
  });

  await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: { sessionId: session1.id, studentId: studentAn.id },
    },
    update: { status: AttendanceStatus.PRESENT },
    create: {
      sessionId: session1.id,
      studentId: studentAn.id,
      status: AttendanceStatus.PRESENT,
    },
  });
  await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: { sessionId: session1.id, studentId: studentBinh.id },
    },
    update: { status: AttendanceStatus.LATE },
    create: {
      sessionId: session1.id,
      studentId: studentBinh.id,
      status: AttendanceStatus.LATE,
    },
  });
  await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: { sessionId: session2.id, studentId: studentAn.id },
    },
    update: { status: AttendanceStatus.PRESENT },
    create: {
      sessionId: session2.id,
      studentId: studentAn.id,
      status: AttendanceStatus.PRESENT,
    },
  });
  await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: { sessionId: session2.id, studentId: studentBinh.id },
    },
    update: { status: AttendanceStatus.ABSENT },
    create: {
      sessionId: session2.id,
      studentId: studentBinh.id,
      status: AttendanceStatus.ABSENT,
    },
  });

  await prisma.tuitionInvoice.upsert({
    where: {
      studentId_period: { studentId: studentAn.id, period: '2026-08' },
    },
    update: {},
    create: {
      studentId: studentAn.id,
      period: '2026-08',
      amount: 1200000,
      dueDate: new Date('2026-08-20T00:00:00.000Z'),
      status: InvoiceStatus.UNPAID,
      note: 'Học phí tháng 8',
    },
  });

  console.log('Phase 3 ops seed OK');
  console.log('GV A: gv.a@dks.vn / Teacher@123456');
  console.log('GV B: gv.b@dks.vn / Teacher@123456');
  console.log('PH:   ph.mai@dks.vn / Parent@123456');
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
