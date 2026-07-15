export type BlogSection = {
  heading: string;
  body: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTimeMinutes: number;
  coverImageId: string;
  featured: boolean;
  intro: string;
  sections: BlogSection[];
  takeaway: string;
};

export type BlogPostSummary = Pick<
  BlogPost,
  | "slug"
  | "title"
  | "excerpt"
  | "category"
  | "publishedAt"
  | "readTimeMinutes"
  | "coverImageId"
  | "featured"
>;

const DEFAULT_SECTIONS: BlogSection[] = [
  {
    heading: "Đặt mục tiêu rõ ràng",
    body: "Trước khi bắt đầu học, hãy xác định mục tiêu cụ thể: thi IELTS đạt 7.0, giao tiếp tự tin với khách hàng nước ngoài, hay vào được trường đại học mong muốn. Mục tiêu rõ ràng giúp bạn chọn đúng lộ trình và duy trì động lực.",
  },
  {
    heading: "Phương pháp học hiệu quả",
    body: "Học theo phương pháp spaced repetition – ôn tập đúng thời điểm trước khi quên. Kết hợp nhiều kỹ năng trong một buổi học thay vì tách riêng lẻ. Luyện nghe, nói, đọc, viết song song để tiến bộ toàn diện.",
  },
  {
    heading: "Tạo môi trường tiếng Anh",
    body: "Bao quanh mình bằng tiếng Anh: đổi ngôn ngữ điện thoại, xem phim với phụ đề tiếng Anh, nghe podcast khi di chuyển. Immersion là cách học tự nhiên và bền vững nhất.",
  },
  {
    heading: "Không sợ mắc lỗi",
    body: "Người học tiến bộ nhanh nhất không phải người ít mắc lỗi nhất, mà là người dám thực hành nhiều nhất. Hãy coi lỗi sai là bước đệm để tiến bộ, không phải rào cản.",
  },
];

const DEFAULT_INTRO =
  "Tiếng Anh là chìa khóa mở ra cơ hội trong thế giới hội nhập. Bài viết này chia sẻ những kiến thức và kinh nghiệm thực tiễn từ đội ngũ giáo viên DKS English Center.";

/** Dữ liệu mẫu từ thiết kế Figma — thay nguồn trong lib/blog/api.ts khi API/CMS sẵn sàng. */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "5-bi-quyet-ielts-writing-band-7",
    title: "5 Bí Quyết Học IELTS Writing Đạt Band 7.0+",
    excerpt:
      "Writing là kỹ năng nhiều thí sinh gặp khó khăn nhất. Bài viết chia sẻ 5 chiến lược giúp bạn cải thiện Writing một cách hệ thống.",
    category: "IELTS Tips",
    publishedAt: "2025-06-15",
    readTimeMinutes: 8,
    coverImageId: "1481627834876-b7833e8f5570",
    featured: true,
    intro:
      "Writing là kỹ năng nhiều thí sinh gặp khó khăn nhất trong kỳ thi IELTS. Tuy nhiên, với phương pháp đúng đắn và luyện tập kiên trì, bạn hoàn toàn có thể đạt band 7.0 trở lên.",
    sections: [
      {
        heading: "1. Nắm vững cấu trúc bài thi",
        body: "Task 1 yêu cầu mô tả dữ liệu từ biểu đồ (150 từ, 20 phút). Task 2 là dạng essay học thuật (250 từ, 40 phút). Hiểu rõ yêu cầu từng Task giúp bạn phân bổ thời gian và chiến lược làm bài hợp lý.",
      },
      {
        heading: "2. Luyện tập viết hàng ngày",
        body: "30 phút viết mỗi ngày hiệu quả hơn 3 tiếng vào cuối tuần. Bắt đầu bằng việc phân tích bài mẫu band 8.0+, học cấu trúc câu và cách triển khai luận điểm, sau đó tự viết lại theo ngôn ngữ của bạn.",
      },
      {
        heading: "3. Xây dựng vốn từ học thuật",
        body: "Tập trung vào Academic Word List (AWL) — 570 từ học thuật phổ biến nhất trong bài thi IELTS. Học theo nhóm chủ đề: Environment, Technology, Education, Health. Tránh lặp từ và dùng từ quá đơn giản.",
      },
      {
        heading: "4. Chú trọng Coherence & Cohesion",
        body: "Dùng linking words đúng chỗ: Furthermore, However, In contrast, As a result, Nevertheless. Mỗi đoạn thân bài cần có topic sentence rõ ràng, supporting ideas và ví dụ cụ thể.",
      },
      {
        heading: "5. Luyện thi theo thời gian thực",
        body: "Đặt đồng hồ 60 phút và hoàn thành cả 2 Tasks. Sau đó tự đánh giá theo 4 tiêu chí: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.",
      },
    ],
    takeaway:
      "Luyện tập đều đặn, hiểu tiêu chí chấm và luôn tự đánh giá sau mỗi bài viết là nền tảng để tiến tới band 7.0+.",
  },
  {
    slug: "phat-am-tieng-anh-chuan-trong-30-ngay",
    title: "Cách Phát Âm Tiếng Anh Chuẩn Trong 30 Ngày",
    excerpt:
      "Phát âm chuẩn là nền tảng của tiếng Anh tự tin. Kế hoạch 30 ngày này sẽ giúp bạn cải thiện pronunciation một cách bài bản.",
    category: "Học Tiếng Anh",
    publishedAt: "2025-06-10",
    readTimeMinutes: 6,
    coverImageId: "1434030216411-0b793f4b4173",
    featured: true,
    intro:
      "Phát âm chuẩn là nền tảng để học tiếng Anh tự tin. Nhiều người học tiếng Anh nhiều năm nhưng vẫn phát âm sai vì thiếu phương pháp hệ thống. Kế hoạch 30 ngày dưới đây sẽ giúp bạn cải thiện đáng kể.",
    sections: [
      {
        heading: "Tuần 1: Nền tảng âm vị học",
        body: "Học 44 âm vị tiếng Anh (phonemes). Tập trung vào các âm không có trong tiếng Việt như /θ/, /ð/, /æ/, /ʌ/, /ɪ/ và nghe phát âm chuẩn trước khi lặp lại.",
      },
      {
        heading: "Tuần 2: Nguyên âm & Phụ âm",
        body: "Luyện từng cặp nguyên âm dễ nhầm: /ɪ/ và /iː/, /ʊ/ và /uː/. Ghi âm và nghe lại giọng mình mỗi ngày để nhận ra lỗi sai.",
      },
      {
        heading: "Tuần 3: Trọng âm từ và câu",
        body: "Trọng âm từ ảnh hưởng lớn đến khả năng hiểu của người nghe. Luyện tập với các từ thường gặp và đánh dấu trọng âm trước khi đọc thành tiếng.",
      },
      {
        heading: "Tuần 4: Ngữ điệu tự nhiên",
        body: "Luyện connected speech bằng phương pháp shadowing với nội dung từ người bản ngữ. Chọn một giọng Anh hoặc Mỹ và duy trì nhất quán.",
      },
    ],
    takeaway:
      "Ba mươi ngày không biến bạn thành người bản ngữ, nhưng đủ để tạo thói quen nghe, ghi âm và sửa lỗi phát âm có hệ thống.",
  },
  {
    slug: "top-10-ung-dung-hoc-tieng-anh-2025",
    title: "Top 10 Ứng Dụng Học Tiếng Anh Hiệu Quả 2025",
    excerpt:
      "Công nghệ AI đang thay đổi cách chúng ta học ngoại ngữ. Điểm qua 10 ứng dụng tốt nhất giúp bạn luyện tập mọi lúc mọi nơi.",
    category: "Công Nghệ",
    publishedAt: "2025-06-05",
    readTimeMinutes: 5,
    coverImageId: "1522202176988-66273c2fd55f",
    featured: false,
    intro: DEFAULT_INTRO,
    sections: DEFAULT_SECTIONS,
    takeaway:
      "Ứng dụng chỉ phát huy hiệu quả khi phục vụ một mục tiêu học rõ ràng và được sử dụng đều đặn.",
  },
  {
    slug: "chien-luoc-luyen-thi-tieng-anh-vao-lop-10",
    title: "Chiến Lược Luyện Thi Tiếng Anh Vào Lớp 10 Hiệu Quả",
    excerpt:
      "Kỳ thi vào lớp 10 có thể chinh phục nếu bạn có chiến lược đúng. Bài viết hướng dẫn từng bước chuẩn bị chi tiết.",
    category: "Thi Cử",
    publishedAt: "2025-06-01",
    readTimeMinutes: 10,
    coverImageId: "1580582932707-520aed937b7b",
    featured: false,
    intro: DEFAULT_INTRO,
    sections: DEFAULT_SECTIONS,
    takeaway:
      "Một kế hoạch ôn tập theo giai đoạn giúp bạn bám sát mục tiêu và giảm áp lực trước ngày thi.",
  },
  {
    slug: "loi-ngu-phap-nguoi-viet-hay-mac",
    title: "Lỗi Ngữ Pháp Người Việt Hay Mắc Khi Học Tiếng Anh",
    excerpt:
      "Phân tích những lỗi ngữ pháp phổ biến và đưa ra cách khắc phục hiệu quả cho người học tiếng Anh tại Việt Nam.",
    category: "Ngữ Pháp",
    publishedAt: "2025-05-25",
    readTimeMinutes: 7,
    coverImageId: "1529400971008-f566de0e6dfc",
    featured: false,
    intro: DEFAULT_INTRO,
    sections: DEFAULT_SECTIONS,
    takeaway:
      "Ghi lại lỗi sai theo nhóm và chủ động dùng lại cấu trúc đúng sẽ giúp bạn tiến bộ bền vững hơn.",
  },
  {
    slug: "hoc-tieng-anh-cung-con-tu-3-tuoi",
    title: "Học Tiếng Anh Cùng Con Từ 3 Tuổi: Nên Hay Không?",
    excerpt:
      "Độ tuổi nào phù hợp để bắt đầu học tiếng Anh? Chuyên gia giải đáp và đưa phương pháp tiếp cận phù hợp từng độ tuổi.",
    category: "Phụ Huynh",
    publishedAt: "2025-05-20",
    readTimeMinutes: 9,
    coverImageId: "1580582932707-520aed937b7b",
    featured: false,
    intro: DEFAULT_INTRO,
    sections: DEFAULT_SECTIONS,
    takeaway:
      "Ở tuổi nhỏ, sự hứng thú và môi trường tiếp xúc tự nhiên quan trọng hơn khối lượng kiến thức.",
  },
];
