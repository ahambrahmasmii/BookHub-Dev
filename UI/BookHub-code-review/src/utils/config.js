const API_KEY = import.meta.env.VITE_REACT_API_URL
const aws_access_key = import.meta.env.VITE_AWS_ACCESS_KEY_ID
const aws_secret_access_key = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY_ID
const aws_bucket_name = import.meta.env.VITE_AWS_BUCKET_NAME
const aws_region = import.meta.env.VITE_AWS_REGION
const cognito_user_pool_id=import.meta.env.VITE_USER_POOL_ID
const cognito_client_id=import.meta.env.VITE_CLIENT_ID
export {API_KEY , aws_access_key , aws_secret_access_key , aws_bucket_name , aws_region , cognito_user_pool_id ,cognito_client_id}
