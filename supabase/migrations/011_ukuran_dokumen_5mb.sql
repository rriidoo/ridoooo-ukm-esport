-- Increase the private application document bucket limit to 5 MiB per file.
update storage.buckets
set file_size_limit = 5242880
where id = 'ridoooo-application-documents';
