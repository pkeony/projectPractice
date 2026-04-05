import { StoreRepository } from './store.repository';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { AppError } from '../../common/types/errors';

const storeRepository = new StoreRepository();

export class StoreService {
  async getMyStoreDetail(userId: string) {
    const store = await storeRepository.findByUserIdWithStats(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다', 'Not Found');
    }

    return store;
  }

  async getMyStoreProducts(userId: string, page: number, pageSize: number) {
    const store = await storeRepository.findByUserId(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다', 'Not Found');
    }

    const { products, total } = await storeRepository.findProductsByStoreId(
      store.id,
      page,
      pageSize
    );

    return {
      list: products,
      totalCount: total,
    };
  }

  async getStoreById(storeId: string, userId?: string) {
    const store = await storeRepository.findById(storeId);

    if (!store) {
      throw new AppError(404, '가게를 찾을 수 없습니다.', 'Not Found');
    }

    const isLiked = userId
      ? store.likes.some((like) => like.userId === userId)
      : false;

    return {
      ...store,
      likeCount: store.likes.length,
      isLiked,
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

  async updateStore(
    userId: string,
    storeId: string,
    updateStoreDto: UpdateStoreDto
  ) {
    const store = await storeRepository.findByUserId(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다', 'Not Found');
    }

    if (store.id !== storeId) {
      throw new AppError(403, '본인의 가게만 수정할 수 있습니다.', 'Forbidden');
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

  async addFavorite(userId: string, storeId: string) {
    const store = await storeRepository.findById(storeId);

    if (!store) {
      throw new AppError(404, '가게를 찾을 수 없습니다', 'Not Found');
    }

    const existingLike = await storeRepository.findLike(userId, storeId);

    if (existingLike) {
      throw new AppError(409, '이미 관심 스토어로 등록되었습니다.', 'Conflict');
    }

    await storeRepository.createLike(userId, storeId);
    return { isLiked: true, message: '관심 스토어로 등록되었습니다.' };
  }

  async removeFavorite(userId: string, storeId: string) {
    const store = await storeRepository.findById(storeId);

    if (!store) {
      throw new AppError(404, '가게를 찾을 수 없습니다', 'Not Found');
    }

    const existingLike = await storeRepository.findLike(userId, storeId);

    if (!existingLike) {
      throw new AppError(404, '관심 스토어로 등록되지 않았습니다.', 'Not Found');
    }

    await storeRepository.deleteLike(userId, storeId);
    return { isLiked: false, message: '관심 스토어가 해제되었습니다.' };
  }
}
