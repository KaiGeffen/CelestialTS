export interface GoogleJwtPayload {
  iss: string;  // issuer
  aud: string;  // audience
  sub: string;  // subject (user ID)
  email: string;
  email_verified: boolean;
  azp: string;  // authorized party
  name: string;
  picture: string;
  given_name: string;
  family_name?: string;
  iat: number;  // issued at
  exp: number;  // expiration time
  jti: string;  // JWT ID
} 