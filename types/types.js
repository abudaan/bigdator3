export type BindType = {
    name: string,
    signals: string | [string, string],
};
export type SpecType = {
    url: string,
    name: string,
    bind: BindType[],
};
export type DataType = {
    amount: number,
    category: string,
};
export type DataSetType = {
    name: string,
    values: DataType[],
};
export type ViewMapType = {
    [id: string]: global.vega.View,
};
export type ConfigType = {
    baseurl: string,
    data: string,
    specs: SpecType[],
};
