variable "aws_region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "supabase_database_url" {
  description = "The connection string for your Supabase PostgreSQL database"
  type        = string
  sensitive   = true
}

variable "backend_image" {
  description = "ECR or Docker Hub image for the backend"
  type        = string
}

variable "frontend_image" {
  description = "ECR or Docker Hub image for the frontend"
  type        = string
}
