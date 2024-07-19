export type MetaInformationTag = "wind_direction";
export const MetaInformationTags : MetaInformationTag[] = ["wind_direction"];
export type MetaInformation = {
  tags: MetaInformationTag[],
} & any;