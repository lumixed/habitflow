output "alb_dns_name" {
  description = "Public URL for the HabitFlow application"
  value       = "http://${aws_lb.habitflow_alb.dns_name}"
}
