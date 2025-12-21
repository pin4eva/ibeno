export interface CreateAssetDTO {
  name: string;
  description: string;
  location: string;
  assetNumber?: string;
  imageUrl?: string;
}

export interface Asset extends CreateAssetDTO {
  id: number;
  assetNumber: string; // Required on the response
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAssetDTO extends Partial<CreateAssetDTO> {
  id: number;
}

export interface AssetFilter {
  search?: string;
  location?: string;
}
