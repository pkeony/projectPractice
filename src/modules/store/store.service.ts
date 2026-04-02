import { StoreRepository } from './store.repository';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { AppError } from '../../common/types/errors';
import { UserType } from '@prisma/client';

const storeRepository = new StoreRepository();

export class StoreService {
  async getMyStore(userId: string) {
    const store = await storeRepository.findByUserId(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다', 'Not Found');
    }

    return store;
  }

  async getStoreById(storeId: string, userId?: string) {
    const store = await storeRepository.findById(storeId);

    if (!store) {
      throw new AppError(404, '가게를 찾을 수 없습니다.', 'Not Found');
    }

    const isLiked = userId
      ? store.likes.some((like) => like.userId === userId) // 유져id가 있으면 좋아요했는지 확인하기
      : //.some() 배열에서 조건을 맞는게 하나라도 있으면 true
        false;

    return {
      ...store,
      likeCount: store.likes.length,
      isLiked,
    };
  }

  async getStores(page: number, limit: number, userId?: string) {
    const { stores, total } = await storeRepository.findAll(page, limit);

    const storesWithInfo = stores.map((store) => {
      //.map 배열의 각 요소를 변환
      const isLiked = userId
        ? store.likes.some((like) => like.userId === userId)
        : false;

      return {
        // 가게마다 likeCount와 lsLiked를 추가
        ...store,
        likeCount: store.likes.length,
        isLiked,
      };
    });

    return {
      stores: storesWithInfo,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createStore(
    userId: string,
    userType: string,
    createStoreDto: CreateStoreDto
  ) {
    if (userType !== 'SELLER') {
      throw new AppError(
        403,
        'SELLER만 가게를 등롷라 수 있습니다.',
        'Forbidden'
      );
    }

    const existingStore = await storeRepository.findByUserId(userId);

    if (existingStore) {
      throw new AppError(409, '이미 등록된 가게가 있습니다.', 'Conflict');
    }

    const store = await storeRepository.create(userId, createStoreDto);

    return store;
  }

  async updateStore(userId: string, updateStoreDto: UpdateStoreDto) {
    const store = await storeRepository.findByUserId(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다', 'Not Found');
    }

    const updateData: UpdateStoreDto = {};

    if (updateStoreDto.name !== undefined)
      updateData.name = updateStoreDto.name;
    if (updateStoreDto.address !== undefined)
      updateData.address = updateStoreDto.address;
    if (updateStoreDto.detailAddress !== undefined)
      updateData.detailAddress = updateStoreDto.detailAddress;
    if (updateStoreDto.phoneNumber !== undefined)
      updateData.phoneNumber = updateStoreDto.phoneNumber;
    if (updateStoreDto.content !== undefined)
      updateData.content = updateStoreDto.content;
    if (updateStoreDto.image !== undefined)
      updateData.image = updateStoreDto.image;

    const updatedStore = await storeRepository.update(store.id, updateData);

    return updatedStore;
  }

  async toggleLike(userId: string, storeId: string) {
    const store = await storeRepository.findById(storeId);

    if (!store) {
      throw new AppError(404, '가게를 찾을 수 없습니다', 'Not Found');
    }

    const existingLike = await storeRepository.findLike(userId, storeId);

    if (existingLike) {
      await storeRepository.deleteLike(userId, storeId);
      return { isliked: false, message: '좋아요가 취소되었습니다.' };
    }

    await storeRepository.createLike(userId, storeId);
    return { isLiked: true, message: '좋아요가 등록되었습니다.' };
  }
}
