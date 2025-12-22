export interface CreateAssetDTO {
  name: string;
  description: string;
  location: string;
  assetNumber?: string;
  imageUrl?: string;
  assetType?: string;
}

export interface Asset extends CreateAssetDTO {
  id: number;
  assetNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAssetDTO extends Partial<CreateAssetDTO> {
  id: number;
}

export interface AssetFilter {
  search?: string;
  location?: string;
  assetType?: string;
}
