import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client';

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

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
