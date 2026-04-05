/// <reference types="node" />
import {
  PrismaClient,
  UserType,
  OrderStatus,
  PaymentStatus,
  InquiryStatus,
} from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 시작...\n');

  // ============================================
  // 1. 기존 데이터 초기화 (순서 중요! 자식 → 부모)
  // ============================================
  console.log('🗑️  기존 데이터 삭제 중...');

  await prisma.notification.deleteMany();
  await prisma.inquiryReply.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeLike.deleteMany();
  await prisma.store.deleteMany();
  await prisma.category.deleteMany();
  await prisma.size.deleteMany();
  await prisma.user.deleteMany();
  await prisma.grade.deleteMany();

  console.log('✅ 기존 데이터 삭제 완료!\n');

  // ============================================
  // 2. Grade (등급)
  // ============================================
  console.log('📊 등급 생성 중...');

  const gradeGreen = await prisma.grade.create({
    data: { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
  });
  const gradeBlue = await prisma.grade.create({
    data: { id: 'grade_blue', name: 'Blue', rate: 3, minAmount: 100000 },
  });
  const gradePurple = await prisma.grade.create({
    data: { id: 'grade_purple', name: 'Purple', rate: 5, minAmount: 500000 },
  });

  console.log('✅ 등급 3개 생성 완료!\n');

  // ============================================
  // 3. Size (사이즈)
  // ============================================
  console.log('📏 사이즈 생성 중...');

  const sizeFree = await prisma.size.create({
    data: { id: 1, name: 'Free', nameEn: 'Free', nameKo: '프리' },
  });
  const sizeXS = await prisma.size.create({
    data: { id: 2, name: 'XS', nameEn: 'Extra Small', nameKo: '극소' },
  });
  const sizeS = await prisma.size.create({
    data: { id: 3, name: 'S', nameEn: 'Small', nameKo: '소' },
  });
  const sizeM = await prisma.size.create({
    data: { id: 4, name: 'M', nameEn: 'Medium', nameKo: '중' },
  });
  const sizeL = await prisma.size.create({
    data: { id: 5, name: 'L', nameEn: 'Large', nameKo: '대' },
  });
  const sizeXL = await prisma.size.create({
    data: { id: 6, name: 'XL', nameEn: 'Extra Large', nameKo: '특대' },
  });

  console.log('✅ 사이즈 6개 생성 완료!\n');

  // ============================================
  // 4. Category (카테고리)
  // ============================================
  console.log('📂 카테고리 생성 중...');

  const catShoes = await prisma.category.create({
    data: { name: 'SHOES' },
  });
  const catTop = await prisma.category.create({
    data: { name: 'TOP' },
  });
  const catBottom = await prisma.category.create({
    data: { name: 'BOTTOM' },
  });
  const catDress = await prisma.category.create({
    data: { name: 'DRESS' },
  });
  const catOuter = await prisma.category.create({
    data: { name: 'OUTER' },
  });
  const catSkirt = await prisma.category.create({
    data: { name: 'SKIRT' },
  });
  const catAcc = await prisma.category.create({
    data: { name: 'ACC' },
  });

  console.log('✅ 카테고리 7개 생성 완료!\n');

  // ============================================
  // 5. User (유저)
  // ============================================
  console.log('👤 유저 생성 중...');

  const hashedPassword = await bcryptjs.hash('password123', 10);

  // SELLER 2명
  const seller1 = await prisma.user.create({
    data: {
      email: 'seller1@test.com',
      password: hashedPassword,
      name: '김판매',
      type: UserType.SELLER,
      gradeId: gradeGreen.id,
      points: 1000,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@test.com',
      password: hashedPassword,
      name: '이셀러',
      type: UserType.SELLER,
      gradeId: gradeGreen.id,
      points: 1000,
    },
  });

  // BUYER 3명
  const buyer1 = await prisma.user.create({
    data: {
      email: 'buyer1@test.com',
      password: hashedPassword,
      name: '박구매',
      type: UserType.BUYER,
      gradeId: gradeGreen.id,
      points: 50000,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'buyer2@test.com',
      password: hashedPassword,
      name: '최바이어',
      type: UserType.BUYER,
      gradeId: gradeBlue.id,
      points: 30000,
      lifetimeSpend: 150000,
    },
  });

  const buyer3 = await prisma.user.create({
    data: {
      email: 'buyer3@test.com',
      password: hashedPassword,
      name: '정VIP',
      type: UserType.BUYER,
      gradeId: gradePurple.id,
      points: 100000,
      lifetimeSpend: 800000,
    },
  });

  console.log('✅ 유저 5명 생성 완료! (SELLER 2, BUYER 3)\n');

  // ============================================
  // 6. Store (가게)
  // ============================================
  console.log('🏪 가게 생성 중...');

  const store1 = await prisma.store.create({
    data: {
      userId: seller1.id,
      name: '나이키 공식스토어',
      address: '서울특별시 강남구 테헤란로 123',
      detailAddress: '3층 301호',
      phoneNumber: '010-1111-2222',
      content: '나이키 공식 판매점입니다. 정품만 취급합니다.',
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/store1.jpg',
    },
  });

  const store2 = await prisma.store.create({
    data: {
      userId: seller2.id,
      name: '패션왕 편집샵',
      address: '서울특별시 마포구 홍대입구로 45',
      detailAddress: '2층',
      phoneNumber: '010-3333-4444',
      content: '트렌디한 패션 아이템을 한 곳에서! 다양한 브랜드 입점.',
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/store2.jpg',
    },
  });

  console.log('✅ 가게 2개 생성 완료!\n');

  // ============================================
  // 7. StoreLike (가게 좋아요)
  // ============================================
  console.log('❤️ 가게 좋아요 생성 중...');

  await prisma.storeLike.createMany({
    data: [
      { userId: buyer1.id, storeId: store1.id },
      { userId: buyer2.id, storeId: store1.id },
      { userId: buyer3.id, storeId: store1.id },
      { userId: buyer1.id, storeId: store2.id },
      { userId: buyer3.id, storeId: store2.id },
    ],
  });

  console.log('✅ 가게 좋아요 5개 생성 완료!\n');

  // ============================================
  // 8. Product (상품)
  // ============================================
  console.log('👟 상품 생성 중...');

  // Store1 상품들 (나이키)
  const product1 = await prisma.product.create({
    data: {
      storeId: store1.id,
      categoryId: catShoes.id,
      name: '나이키 에어맥스 90',
      price: 159000,
      discountRate: 10,
      content: '클래식한 디자인의 에어맥스 90. 편안한 착용감.',
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/product1.jpg',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      storeId: store1.id,
      categoryId: catShoes.id,
      name: '나이키 에어포스 1',
      price: 129000,
      content: '세계에서 가장 사랑받는 스니커즈.',
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/product2.jpg',
    },
  });

  const product3 = await prisma.product.create({
    data: {
      storeId: store1.id,
      categoryId: catTop.id,
      name: '나이키 드라이핏 티셔츠',
      price: 45000,
      discountRate: 20,
      content: '땀을 빠르게 흡수하는 드라이핏 소재.',
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/product3.jpg',
    },
  });

  // Store2 상품들 (편집샵)
  const product4 = await prisma.product.create({
    data: {
      storeId: store2.id,
      categoryId: catOuter.id,
      name: '오버사이즈 후드티',
      price: 68000,
      content: '편안한 오버핏 후드티. 남녀공용.',
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/product4.jpg',
    },
  });

  const product5 = await prisma.product.create({
    data: {
      storeId: store2.id,
      categoryId: catAcc.id,
      name: '스테인리스 시계',
      price: 250000,
      discountRate: 15,
      content: '고급스러운 스테인리스 소재의 클래식 시계.',
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/product5.jpg',
    },
  });

  const product6 = await prisma.product.create({
    data: {
      storeId: store2.id,
      categoryId: catAcc.id,
      name: '캔버스 토트백',
      price: 35000,
      content: '데일리로 사용하기 좋은 캔버스 토트백.',
      image:
        'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/product6.jpg',
      isSoldOut: true,
    },
  });

  console.log('✅ 상품 6개 생성 완료!\n');

  // ============================================
  // 9. ProductStock (재고)
  // ============================================
  console.log('📦 재고 생성 중...');

  await prisma.productStock.createMany({
    data: [
      // 에어맥스 90
      { productId: product1.id, sizeId: sizeS.id, quantity: 50 },
      { productId: product1.id, sizeId: sizeM.id, quantity: 30 },
      { productId: product1.id, sizeId: sizeL.id, quantity: 20 },
      { productId: product1.id, sizeId: sizeXL.id, quantity: 10 },
      // 에어포스 1
      { productId: product2.id, sizeId: sizeS.id, quantity: 100 },
      { productId: product2.id, sizeId: sizeM.id, quantity: 80 },
      { productId: product2.id, sizeId: sizeL.id, quantity: 60 },
      // 드라이핏 티셔츠
      { productId: product3.id, sizeId: sizeM.id, quantity: 200 },
      { productId: product3.id, sizeId: sizeL.id, quantity: 150 },
      { productId: product3.id, sizeId: sizeXL.id, quantity: 100 },
      // 오버사이즈 후드티
      { productId: product4.id, sizeId: sizeM.id, quantity: 40 },
      { productId: product4.id, sizeId: sizeL.id, quantity: 40 },
      { productId: product4.id, sizeId: sizeXL.id, quantity: 30 },
      // 스테인리스 시계 (사이즈 없는 상품 → M으로 통일)
      { productId: product5.id, sizeId: sizeM.id, quantity: 15 },
      // 캔버스 토트백 (품절!)
      { productId: product6.id, sizeId: sizeM.id, quantity: 0 },
    ],
  });

  console.log('✅ 재고 15개 생성 완료!\n');

  // ============================================
  // 10. Cart + CartItem (장바구니)
  // ============================================
  console.log('🛒 장바구니 생성 중...');

  const cart1 = await prisma.cart.create({
    data: {
      buyerId: buyer1.id,
      items: {
        create: [
          { productId: product1.id, sizeId: sizeM.id, quantity: 1 },
          { productId: product4.id, sizeId: sizeL.id, quantity: 2 },
        ],
      },
    },
  });

  const cart2 = await prisma.cart.create({
    data: {
      buyerId: buyer2.id,
      items: {
        create: [{ productId: product2.id, sizeId: sizeS.id, quantity: 1 }],
      },
    },
  });

  console.log('✅ 장바구니 2개 생성 완료!\n');

  // ============================================
  // 11. Order + OrderItem + Payment (주문)
  // ============================================
  console.log('📋 주문 생성 중...');

  // buyer1의 완료된 주문 (리뷰 작성용!)
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      name: '박구매',
      phoneNumber: '010-5555-6666',
      address: '서울특별시 서초구 서초대로 200',
      subtotal: 288000,
      usePoint: 0,
      status: OrderStatus.CompletedPayment,
      items: {
        create: [
          {
            productId: product1.id,
            sizeId: sizeM.id,
            quantity: 1,
            price: 159000,
          },
          {
            productId: product2.id,
            sizeId: sizeS.id,
            quantity: 1,
            price: 129000,
          },
        ],
      },
      payment: {
        create: {
          price: 288000,
          status: PaymentStatus.Paid,
        },
      },
    },
    include: { items: true },
  });

  // buyer2의 완료된 주문
  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      name: '최바이어',
      phoneNumber: '010-7777-8888',
      address: '서울특별시 용산구 이태원로 100',
      subtotal: 113000,
      usePoint: 5000,
      status: OrderStatus.CompletedPayment,
      items: {
        create: [
          {
            productId: product3.id,
            sizeId: sizeM.id,
            quantity: 1,
            price: 45000,
          },
          {
            productId: product4.id,
            sizeId: sizeL.id,
            quantity: 1,
            price: 68000,
          },
        ],
      },
      payment: {
        create: {
          price: 108000,
          status: PaymentStatus.Paid,
        },
      },
    },
    include: { items: true },
  });

  // buyer3의 결제 대기 주문
  const order3 = await prisma.order.create({
    data: {
      buyerId: buyer3.id,
      name: '정VIP',
      phoneNumber: '010-9999-0000',
      address: '서울특별시 강남구 압구정로 300',
      subtotal: 250000,
      usePoint: 10000,
      status: OrderStatus.WaitingPayment,
      items: {
        create: [
          {
            productId: product5.id,
            sizeId: sizeM.id,
            quantity: 1,
            price: 250000,
          },
        ],
      },
    },
    include: { items: true },
  });

  // buyer1의 취소된 주문
  const order4 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      name: '박구매',
      phoneNumber: '010-5555-6666',
      address: '서울특별시 서초구 서초대로 200',
      subtotal: 68000,
      usePoint: 0,
      status: OrderStatus.Canceled,
      items: {
        create: [
          {
            productId: product4.id,
            sizeId: sizeM.id,
            quantity: 1,
            price: 68000,
          },
        ],
      },
      payment: {
        create: {
          price: 68000,
          status: PaymentStatus.Canceled,
        },
      },
    },
    include: { items: true },
  });

  console.log('✅ 주문 4개 생성 완료! (완료2, 대기1, 취소1)\n');

  // ============================================
  // 12. Review (리뷰)
  // ============================================
  console.log('⭐ 리뷰 생성 중...');

  await prisma.review.createMany({
    data: [
      {
        userId: buyer1.id,
        productId: product1.id,
        orderItemId: order1.items[0].id,
        rating: 5,
        content:
          '에어맥스 90 최고입니다! 쿠션감이 정말 좋아요. 사이즈도 딱 맞습니다.',
      },
      {
        userId: buyer1.id,
        productId: product2.id,
        orderItemId: order1.items[1].id,
        rating: 4,
        content: '에어포스 역시 클래식! 다만 처음에 좀 딱딱해요.',
      },
      {
        userId: buyer2.id,
        productId: product3.id,
        orderItemId: order2.items[0].id,
        rating: 5,
        content: '드라이핏 소재 진짜 좋아요. 운동할 때 땀 안 차요!',
      },
      {
        userId: buyer2.id,
        productId: product4.id,
        orderItemId: order2.items[1].id,
        rating: 3,
        content: '오버핏이라 편한데 생각보다 좀 더 큽니다.',
      },
    ],
  });

  console.log('✅ 리뷰 4개 생성 완료!\n');

  // ============================================
  // 13. Inquiry + InquiryReply (문의)
  // ============================================
  console.log('❓ 문의 생성 중...');

  const inquiry1 = await prisma.inquiry.create({
    data: {
      userId: buyer1.id,
      productId: product5.id,
      title: '시계 방수 되나요?',
      content: '일상 방수가 가능한지 궁금합니다. 수영할 때도 착용 가능한가요?',
      isSecret: false,
      status: InquiryStatus.CompletedAnswer,
      reply: {
        create: {
          userId: seller2.id,
          content:
            '안녕하세요! 일상 생활 방수는 가능하지만 수영 시 착용은 권장하지 않습니다.',
        },
      },
    },
  });

  const inquiry2 = await prisma.inquiry.create({
    data: {
      userId: buyer2.id,
      productId: product1.id,
      title: '발볼이 넓은 편인가요?',
      content: '발볼이 넓은 편인데 정사이즈로 주문해도 될까요?',
      isSecret: false,
      status: InquiryStatus.WaitingAnswer,
    },
  });

  const inquiry3 = await prisma.inquiry.create({
    data: {
      userId: buyer3.id,
      productId: product6.id,
      title: '재입고 언제 되나요?',
      content: '토트백 재입고 일정이 궁금합니다.',
      isSecret: true,
      status: InquiryStatus.WaitingAnswer,
    },
  });

  console.log('✅ 문의 3개 생성 완료! (답변완료1, 대기2)\n');

  // ============================================
  // 14. Notification (알림)
  // ============================================
  console.log('🔔 알림 생성 중...');

  await prisma.notification.createMany({
    data: [
      {
        userId: seller1.id,
        content: '새로운 문의가 등록되었습니다: "발볼이 넓은 편인가요?"',
        type: 'NEW_INQUIRY',
        isChecked: false,
      },
      {
        userId: seller2.id,
        content: '새로운 문의가 등록되었습니다: "재입고 언제 되나요?"',
        type: 'NEW_INQUIRY',
        isChecked: false,
      },
      {
        userId: buyer1.id,
        content: '문의에 답변이 등록되었습니다: "시계 방수 되나요?"',
        type: 'INQUIRY_REPLIED',
        isChecked: true,
      },
      {
        userId: buyer1.id,
        content: '캔버스 토트백이 품절되었습니다.',
        type: 'PRODUCT_SOLDOUT',
        isChecked: false,
      },
    ],
  });

  console.log('✅ 알림 4개 생성 완료!\n');

  // ============================================
  // 🎉 완료!
  // ============================================
  console.log('========================================');
  console.log('🎉 시드 완료! 생성된 데이터:');
  console.log('========================================');
  console.log('📊 등급:     3개 (Green, Blue, Purple)');
  console.log('📏 사이즈:   6개 (Free, XS, S, M, L, XL)');
  console.log('📂 카테고리: 7개 (SHOES, TOP, BOTTOM, DRESS, OUTER, SKIRT, ACC)');
  console.log('👤 유저:     5명 (SELLER 2, BUYER 3)');
  console.log('🏪 가게:     2개');
  console.log('❤️ 좋아요:   5개');
  console.log('👟 상품:     6개 (품절 1개 포함)');
  console.log('📦 재고:     15개');
  console.log('🛒 장바구니: 2개');
  console.log('📋 주문:     4개 (완료2, 대기1, 취소1)');
  console.log('⭐ 리뷰:     4개');
  console.log('❓ 문의:     3개 (답변완료1, 대기2)');
  console.log('🔔 알림:     4개');
  console.log('========================================\n');
  console.log('🔑 로그인 정보 (비밀번호: password123)');
  console.log('────────────────────────────────────────');
  console.log('SELLER: seller1@test.com / seller2@test.com');
  console.log('BUYER:  buyer1@test.com / buyer2@test.com / buyer3@test.com');
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('❌ 시드 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
