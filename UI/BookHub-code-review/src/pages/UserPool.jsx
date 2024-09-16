import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "eu-north-1_XRkGy0ygS",
  ClientId: "mmb7mn1oj09oh8s00sbpvuv39",
};

export default new CognitoUserPool(poolData);
