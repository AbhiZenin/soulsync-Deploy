export type ProfileCard={userId:string;displayName:string;age?:number;gender?:string;heightCm?:number;city?:string;state?:string;country?:string;religion?:string;motherTongue?:string;education?:string;occupation?:string;primaryPhoto?:string;matchScore?:number;lastActiveAt?:string;emailVerified?:boolean;boosted?:boolean;};
export type ProfileDetail=ProfileCard&{dateOfBirth?:string;maritalStatus?:string;community?:string;incomeRange?:string;diet?:string;smoking?:string;drinking?:string;about?:string;profileCreatedBy?:string;visibility:string;completionPercent:number;photos:{id:string;url:string;sortOrder:number;primary:boolean;visibility:string}[]};
export type Interest={id:string;senderId:string;receiverId:string;status:string;createdAt:string};
export type Conversation={id:string;otherUserId:string;otherDisplayName:string;updatedAt:string};
export type ChatMessage={id:string;conversationId:string;senderId:string;body:string;type:string;status:string;createdAt:string;readAt?:string};
