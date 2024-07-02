class Job:
    # def __init__(self, row, header, the_id) -> None:
    #     self.__dict__ = dict(zip(header, row))
    #     self.the_id = the_id
    #
    # def __repr__(self):
    #     return self.the_id

    def __init__(
        self,
        site,
        job_url,
        title,
        company,
        location,
        job_type,
        date_posted,
        interval,
        min_amount,
        max_amount,
        currency,
        is_remote,
        emails,
        description,
        years_of_experience,
        skills_required,
    ) -> None:
        self.site = site
        self.job_url = job_url
        self.title = title
        self.company = company
        self.location = location
        self.job_type = job_type
        self.date_posted = date_posted
        self.interval = interval
        self.min_amount = min_amount
        self.max_amount = max_amount
        self.currency = currency
        self.is_remote = is_remote
        self.emails = emails
        self.description = description
        self.years_of_experience = years_of_experience
        self.skills_required = skills_required

    def __getitem__(self, key):
        return getattr(self, key)

    def __setitem__(self, key, new):
        setattr(self, key, new)
